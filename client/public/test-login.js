// Simple test script to check admin login
// Copy and paste this into the browser console when on the staff login page

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login directly via API');
    
    const loginData = {
      phone: '+919303228082',
      password: 'testpassword123'
    };
    
    console.log('📤 Sending login request with:', {
      phone: loginData.phone,
      passwordLength: loginData.password.length
    });
    
    // Make the request to the login endpoint
    const response = await fetch('http://localhost:5001/api/auth/login-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('📋 Response data:', {
        success: data.success,
        message: data.message,
        user: data.data?.user ? {
          name: data.data.user.name,
          role: data.data.user.role,
          phone: data.data.user.phone
        } : null,
        hasToken: !!data.data?.token
      });
      
      // Store the token and user in localStorage
      if (data.data?.token && data.data?.user) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('✅ Token and user stored in localStorage');
      }
      
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

// Function to test the login form submission
function testLoginForm() {
  console.log('🔍 Testing login form submission');
  
  // Get the form elements
  const phoneInput = document.querySelector('input[name="phone"]');
  const passwordInput = document.querySelector('input[name="password"]');
  const loginButton = document.querySelector('button[type="submit"]');
  
  if (!phoneInput || !passwordInput || !loginButton) {
    console.error('❌ Could not find form elements');
    return;
  }
  
  // Set the form values
  const phone = '+919303228082';
  const password = 'testpassword123';
  
  // Set the input values
  phoneInput.value = phone;
  passwordInput.value = password;
  
  // Dispatch input events to trigger React state updates
  phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
  passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
  
  console.log('📤 Form values set:', {
    phone: phoneInput.value,
    passwordLength: passwordInput.value.length
  });
  
  // Submit the form
  loginButton.click();
  
  console.log('📤 Form submitted');
}

// Run the tests
console.log('🧪 Admin Login Test Script');
console.log('1. Run testAdminLogin() to test direct API login');
console.log('2. Run testLoginForm() to test form submission');