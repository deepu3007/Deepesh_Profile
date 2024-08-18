document.addEventListener('DOMContentLoaded', function() {
    async function fetchAndDisplayBlogPosts() {
        try {
            const response = await fetch('/blog/fetch-blog-posts/');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const blogPosts = await response.json();
            const container = document.querySelector('#blog-posts-container');

            if (blogPosts.length === 0) {
                container.innerHTML = '<p>No blog posts available.</p>';
                return;
            }

            container.innerHTML = blogPosts.map(post => `
                <div class="blog-post-card">
                    <img src="${post.imageUrl}" alt="Blog Post Image" class="blog-post-image">
                    <h5 class="blog-post-title">${post.title}</h5>
                    <p class="blog-post-content">${post.content}</p>
                    <div class="blog-post-footer">
                        <button class="btn btn-like" data-post-id="${post.id}" data-liked="${post.userLiked ? 'true' : 'false'}">
                            <i class="fas fa-thumbs-up"></i> <span class="like-count">${post.likes || 0}</span> ${post.userLiked ? 'Dislike' : 'Like'}
                        </button>
                        <button class="btn btn-comment" data-post-id="${post.id}">
                            <i class="fas fa-comment"></i> <span class="comment-count">${Object.keys(post.comments || {}).length}</span> Comment
                        </button>
                    </div>
                    <div class="blog-post-comments-section" style="display: none;">
                        <div class="comments-container">
                            ${post.comments && Object.keys(post.comments).length > 0
                                ? Object.keys(post.comments).map(key => {
                                    const comment = post.comments[key];
                                    return `
                                        <div class="comment">
                                            <p><strong>${comment.name}:</strong> ${comment.text}</p>
                                            <p><small>${new Date(comment.timestamp).toLocaleString()}</small></p>
                                        </div>
                                    `;
                                }).join('')
                                : '<p>No comments yet.</p>'}
                        </div>
                        <form class="comment-form" data-post-id="${post.id}">
                            <input type="text" name="name" placeholder="Your name" required>
                            <textarea name="comment" placeholder="Your comment" required></textarea>
                            <button type="submit">Add Comment</button>
                        </form>
                    </div>
                </div>
            `).join('');



            // Add event listeners for like buttons
            document.querySelectorAll('.btn-like').forEach(button => {
                button.addEventListener('click', async function() {
                    const postId = this.getAttribute('data-post-id');
                    const isLiked = this.getAttribute('data-liked') === 'true';
                    const likeCountElement = this.querySelector('.like-count');
                    let newLikes;

                    if (isLiked) {
                        // User wants to Dislike
                        newLikes = parseInt(likeCountElement.textContent, 10) - 1;
                        this.setAttribute('data-liked', 'false');
                        this.innerHTML = `<i class="fas fa-thumbs-up"></i> <span class="like-count">${newLikes}</span> Like`;
                    } else {
                        // User wants to like
                        newLikes = parseInt(likeCountElement.textContent, 10) + 1;
                        this.setAttribute('data-liked', 'true');
                        this.innerHTML = `<i class="fas fa-thumbs-up"></i> <span class="like-count">${newLikes}</span> Dislike`;
                    }

                    likeCountElement.textContent = newLikes;

                    // Update the likes in Firebase
                    try {
                        await fetch(`/blog/update-likes/${postId}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')  // CSRF token for Django
                            },
                            body: JSON.stringify({ likes: newLikes, userLiked: !isLiked })
                        });
                    } catch (error) {
                        console.error('Error updating likes:', error);
                    }
                });
            });

            // Add event listeners for comment buttons
            document.querySelectorAll('.btn-comment').forEach(button => {
                button.addEventListener('click', function() {
                    const postId = this.getAttribute('data-post-id');
                    const commentsSection = this.closest('.blog-post-card').querySelector('.blog-post-comments-section');
                    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
                });
            });

            // Add event listeners for comment forms
            document.querySelectorAll('.comment-form').forEach(form => {
                form.addEventListener('submit', async function(event) {
                    event.preventDefault();

                    const postId = this.getAttribute('data-post-id');
                    const name = this.querySelector('input[name="name"]').value;
                    const commentText = this.querySelector('textarea[name="comment"]').value;

                    const comment = {
                        name: name,
                        text: commentText,
                        timestamp: new Date().toISOString()
                    };

                    // Add comment to Firebase
                    try {
                        const response = await fetch(`/blog/add-comment/${postId}/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')  // CSRF token for Django
                            },
                            body: JSON.stringify(comment)  // Send only the comment object
                        });

                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }

                        // Update the comments section with the new comment
                        const commentsSection = this.closest('.blog-post-comments-section');
                        const commentId = Date.now();  // Generate a unique ID using timestamp
                        commentsSection.innerHTML += `
                            <div class="comment">
                                <p><strong>${name}:</strong> ${commentText}</p>
                                <p><small>${new Date(comment.timestamp).toLocaleString()}</small></p>
                            </div>
                        `;

                        // Clear the form fields
                        this.reset();
                    } catch (error) {
                        console.error('Error adding comment:', error);
                    }
                });
            });

        } catch (error) {
            console.error('Error fetching blog posts:', error);
        }
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Fetch and display blog posts on page load
    fetchAndDisplayBlogPosts();
});
