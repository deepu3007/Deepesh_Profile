document.getElementById('contactForm').onsubmit = function(event) {
    event.preventDefault(); // Prevent the default form submission

    var formData = new FormData(this);
    var contactUrl = this.getAttribute('data-contact-url'); // Get the contact URL from the form's data attribute

    fetch(contactUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            showSuccessModal(); // Show the success modal
        } else {
            document.getElementById('form-messages').innerText = data.message || 'An error occurred';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('form-messages').innerText = 'An error occurred';
    });
};

// Function to show the success modal
function showSuccessModal() {
    var successModal = new bootstrap.Modal(document.getElementById('successModal'));
    successModal.show();
}

// Function to close the success modal
function closeSuccessModal() {
    var successModalElement = document.getElementById('successModal');
    var successModal = bootstrap.Modal.getInstance(successModalElement);
    if (successModal) {
        successModal.hide();
    }
}

// Close the modal if the user clicks outside of it
window.onclick = function(event) {
    var successModalElement = document.getElementById('successModal');
    if (event.target == successModalElement) {
        closeSuccessModal();
    }
};

// Ensure the modal close button works
document.querySelector('#successModal .btn-close').addEventListener('click', closeSuccessModal);
setTimeout(closeSuccessModal, 3000); // Automatically closes the modal after 3 seconds


