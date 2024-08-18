import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.prompts import ChatPromptTemplate
import google.generativeai as genai
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from dotenv import load_dotenv
import shutil

# Load environment variables
load_dotenv()
google_api_key = os.getenv('GOOGLE_API_KEY')
genai.configure(api_key=google_api_key)

CHROMA_PATH = "chatbot/static/chatbot/documents"
PROMPT_TEMPLATE = """
You are an intelligent chatbot and your name is VeerBot designed to assist users based on Information about Deepesh/Veera Deepesh Gondimalla which is the provided context and previous chat history. 
When user starts the conversation with greeting message.Have a good conversation, the chat history that I give you is your own chat history with the user.
**Task:** 
- If user greets, greet the user properly with good greeting messages.
- Understand and respond to user queries using the context and chat history.
- Analyze the chat history to provide relevant answers. If the history does not provide a satisfactory answer, use the context provided.

**Instructions:**
1. Review the chat history first.
2. If the chat history does not offer a clear answer, use the context to formulate your response.
3. Answer precisely and use a maximum of 120 words.( answer size :- 20 - 120 words)

**Chat History:** 
{chat_history}

**User Question:** 
{question}

**Context:** 
{context}

**Your Response:**
"""

def split_text(documents):
    """Split documents into chunks."""
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=10000,  # Maximum size of each chunk
        chunk_overlap=1000,  # Overlap between chunks
        length_function=len,  # Function to determine length of text
        add_start_index=True,  # Include start index in chunks
    )
    chunks = text_splitter.split_documents(documents)
    print(f"Split {len(documents)} documents into {len(chunks)} chunks.")
    return chunks

def load_documents(directory):
    """Load documents from a directory (supports PDF, text, and Word files)."""
    all_pages = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            if file_path.endswith('.pdf'):
                # Load and split PDF documents
                loader = PyPDFLoader(file_path)
                pages = loader.load_and_split()
                all_pages.extend(pages)
                print(f"PDF Document '{file}' with {len(pages)} pages processed.")
            elif file_path.endswith('.txt'):
                # Load and process text files
                loader = TextLoader(file_path)
                pages = loader.load_and_split()
                all_pages.extend(pages)
                print(f"Text Document '{file}' with {len(pages)} pages processed.")
    return all_pages

def create_vector_db(chunks):
    """Create and persist a Chroma vector store."""
    if not os.path.exists(CHROMA_PATH):
        os.makedirs(CHROMA_PATH)
    
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", api_key=google_api_key)
    
    # Initialize Chroma with the correct settings
    db = Chroma.from_documents(chunks, embeddings)
    print(f"Saved {len(chunks)} chunks to {CHROMA_PATH}.")
    return db

def retrieve_and_invoke(vectordb, query_text, context_history):
    # Retrieve documents relevant to the query
    results = vectordb.similarity_search_with_relevance_scores(query_text, k=5)
    if len(results) == 0:
        return "Unable to find matching results.", []
    
    # Construct the context from the retrieved documents
    context_text = "\n\n---\n\n".join([doc.page_content for doc, _score in results])
    prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
    
    # Combine existing context history with the new context
    context_history = "\n\n".join([context_history, context_text]) if context_history else context_text
    # Generate the prompt
    prompt = prompt_template.format(context=context_text, question=query_text, chat_history=context_history)
    
    model = genai.GenerativeModel(model_name="gemini-pro")
    response_text = model.generate_content(prompt).text
    sources = [doc.metadata.get("source", None) for doc, _score in results]
    return response_text

def process_question(query_text, context_history):
    """Process a user question and return a response."""
    documents = load_documents(CHROMA_PATH)  # Adjust the path to your documents
    chunks = split_text(documents)
    vectordb = create_vector_db(chunks)
    return retrieve_and_invoke(vectordb, query_text, context_history)
