function submitForm() {
    // Get the values from the form
    const fullName = document.getElementById('contactName').value;
    const contactNumber = document.getElementById('contactNumber').value;
    const barber = document.getElementById('contactDiscord').value;
    const experience = document.getElementById('contactWhy').value;
    const extraMessage = document.getElementById('extraMessage').value;
  
    // Construct the Google Form URL with the form values
    const formAction = 'https://docs.google.com/forms/d/e/1FAIpQLSekCuxfWtQAMsST1MID4jROcQuXABAZvfmpHGazq79eXXnqxQ/formResponse';
    const formUrl = `${formAction}?entry.606961538=${encodeURIComponent(fullName)}&entry.309809418=${encodeURIComponent(contactNumber)}&entry.457319759=${encodeURIComponent(barber)}&entry.1653990664=${encodeURIComponent(experience)}&entry.792655874=${encodeURIComponent(extraMessage)}`;
  
    // Submit the form by creating a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = formUrl;
    document.body.appendChild(iframe);
  
  }
  