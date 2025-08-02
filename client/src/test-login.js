// This is a simple test script to check the login flow
// You can run this in the browser console when on the login page

function testAdminLogin() {
  console.log('🔍 Testing admin login from client side');
  
  // Get the login function from the AuthContext
  const authContext = window.__REACT_CONTEXT_DEVTOOL_GLOBAL_HOOK.renderers[0].stateNodes.get(document.querySelector('[data-testid="staff-login-form"]').__reactFiber$);
  
  // Find the login function in the context
  const login = authContext?.memoizedState?.login;
  
  if (!login) {
    console.error('❌ Could not find login function in AuthContext');
    return;
  }
  
  // Admin credentials
  const phone = '+919303228082';
  const password = 'testpassword123';
  
  console.log('📤 Attempting login with:', {
    phone,
    passwordLength: password.length
  });
  
  // Call the login function directly
  login(phone, password)
    .then(result => {
      console.log('✅ Login successful!', result);
    })
    .catch(error => {
      console.error('❌ Login failed:', error);
    });
}

// Run the test
testAdminLogin();