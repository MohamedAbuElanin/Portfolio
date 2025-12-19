document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phone = document.getElementById('phone').value;
    const birthDate = document.getElementById('birthDate').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = "");
    let isValid = true;
    if (firstName.length < 3 || !/^[A-Z]/.test(firstName)) {
        document.getElementById('firstError').innerText = "Must start with Capital and be > 2 letters";
        isValid = false;
    }
    if (lastName.length < 3 || !/^[A-Z]/.test(lastName)) {
        document.getElementById('lastError').innerText = "Must start with Capital and be > 2 letters";
        isValid = false;
    }
    if (!/^(010|011|012|015)\d{8}$/.test(phone)) {
        document.getElementById('phoneError').innerText = "Invalid Egyptian phone number (11 digits)";
        isValid = false;
    }
    if (!/^\d{4}\/\d{2}\/\d{2}$/.test(birthDate)) {
        document.getElementById('birthError').innerText = "Format must be yyyy/mm/dd";
        isValid = false;
    }
    if (!email.includes("@") || !email.includes(".")) {
        document.getElementById('emailError').innerText = "Please enter a valid email";
        isValid = false;
    }
    if (password.length < 8) {
        document.getElementById('passError').innerText = "Password must be at least 8 characters";
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('passError').innerText = "Passwords do not match";
        isValid = false;
    }
    if (isValid) {
        Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Form submitted successfully',
            confirmButtonColor: '#4e4376'
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Invalid Input',
            text: 'Please check your inputs and try again.',
            confirmButtonColor: '#2b5876'
        });
    }
});