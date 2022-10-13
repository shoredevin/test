// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket));
// Use localStorage to store our login token
client.configure(feathers.authentication());

// Login screen
const loginHTML = `<main class="login container">

  <!-- REMOVE MESSAGE BEGIN -->

  <div style="background-color: rgb(4 0 255 / 6%); padding: 15px; border-radius: 10px; margin-top: 10px;">
    <div class="row">
      <div class="col-6 push-3 col-3-tablet no-push-tablet text-center">
        <img src="https://adaptable.io/img/party-popper.svg" style="max-width: 100px;" />
      </div>
      <div class="col-12 col-6-tablet text-center">
        <p style="font-size: 1.5rem">
          Your app is now running on
        </p>
        <img src="https://adaptable.io/img/color lockup.svg" style="max-width: 200px;" />
      </div>
      <div class="none inline-tablet col-3-tablet text-center">
        <img src="https://adaptable.io/img/party-popper.svg" style="max-width: 100px;" />
      </div>
    </div>

    <h2 class="font-900 h1 text-center">Check out Your New App!</h2>

    <div class="row">
      <p class="text-center" style="max-width: 600px; margin: auto">
        Enter a username and password below and click &quot;Sign up and log in&quot; to use the app.  
        You can also create a separate account in an private tab to chat with yourself.
      </p>
    </div>

    <div class="row">
      <p class="text-center" style="margin: auto; max-width: 600px">
        See the <a href="https://adaptable.io/docs/starters/feathers-chat-starter#what-s-next" target="_blank">Feathers Chat Starter Guide</a> for step-by-step
        instructions on how to deploy a code update, set up environment variables, and more!
      </p>
      <p class="text-center">
        <a target="_blank" href="https://adaptable.io/docs/starters/feathers-chat-starter#what-s-next" style="display: inline-block; background: #363795; padding: 13px 30px; border-radius: 30px; color: #fff; font-size:18px;">Go to the Starter Guide</a>
      </p>
    </div>
  </div>

  <!-- REMOVE MESSAGE END -->

  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center heading">
      <h1 class="font-100">Feathers Chat<br />Log in or signup</h1>
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
      <form class="form">
        <fieldset>
          <input class="block" type="email" name="email" placeholder="email">
        </fieldset>

        <fieldset>
          <input class="block" type="password" name="password" placeholder="password">
        </fieldset>

        <button type="button" id="login" class="button button-primary block signup">
          Log in
        </button>

        <button type="button" id="signup" class="button button-primary block signup">
          Sign up and log in
        </button>

        <a class="button button-primary block" href="/oauth/github">
          Login with GitHub
        </a>
      </form>
    </div>
  </div>
</main>`;

// Chat base HTML (without user list and messages)
const chatHTML = `
<main class="flex flex-column">
  <header class="title-bar flex flex-row flex-center">
    <div class="title-wrapper block center-element">
      <img class="logo" src="http://feathersjs.com/img/feathers-logo-wide.png"
        alt="Feathers Logo">
      <span class="title">Chat</span>
    </div>
  </header>

  <div class="flex flex-row flex-1 clear">
    <aside class="sidebar col col-3 flex flex-column flex-space-between">
      <header class="flex flex-row flex-center">
        <h4 class="font-300 text-center">
          <span class="font-600 online-count">0</span> users
        </h4>
      </header>

      <ul class="flex flex-column flex-1 list-unstyled user-list"></ul>
      <footer class="flex flex-row flex-center">
        <a href="#" id="logout" class="button button-primary">
          Sign Out
        </a>
      </footer>
    </aside>

    <div class="flex flex-column col col-9">
      <main class="chat flex flex-column flex-1 clear"></main>

      <form class="flex flex-row flex-space-between" id="send-message">
        <input type="text" name="text" class="flex flex-1">
        <button class="button-primary" type="submit">Send</button>
      </form>
    </div>
  </div>
</main>`;

// Helper to safely escape HTML
const escape = str => str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Add a new user to the list
const addUser = user => {
  const userList = document.querySelector('.user-list');

  if(userList) {
    // Add the user to the list
    userList.innerHTML += `<li>
      <a class="block relative" href="#">
        <img src="${user.avatar}" alt="" class="avatar">
        <span class="absolute username">${escape(user.name || user.email)}</span>
      </a>
    </li>`;

    // Update the number of users
    const userCount = document.querySelectorAll('.user-list li').length;
    
    document.querySelector('.online-count').innerHTML = userCount;
  }
};

// Renders a message to the page
const addMessage = message => {
  // The user that sent this message (added by the populate-user hook)
  const { user = {} } = message;
  const chat = document.querySelector('.chat');
  // Escape HTML to prevent XSS attacks
  const text = escape(message.text);

  if(chat) {
    chat.innerHTML += `<div class="message flex flex-row">
      <img src="${user.avatar}" alt="${user.name || user.email}" class="avatar">
      <div class="message-wrapper">
        <p class="message-header">
          <span class="username font-600">${escape(user.name || user.email)}</span>
          <span class="sent-date font-300">${moment(message.createdAt).format('MMM Do, hh:mm:ss')}</span>
        </p>
        <p class="message-content font-300">${text}</p>
      </div>
    </div>`;

    // Always scroll to the bottom of our message list
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  }
};

// Show the login page
const showLogin = (error) => {
  if(document.querySelectorAll('.login').length && error) {
    document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${error.message}</p>`);
  } else {
    document.getElementById('app').innerHTML = loginHTML;
  }
};

// Shows the chat page
const showChat = async () => {
  document.getElementById('app').innerHTML = chatHTML;

  // Find the latest 25 messages. They will come with the newest first
  const messages = await client.service('messages').find({
    query: {
      $sort: { createdAt: -1 },
      $limit: 25
    }
  });
  
  /* REMOVE MESSAGE BEGIN */
  const chat = document.querySelector('.chat');
  if(chat && messages.data.length < 25) {
    chat.innerHTML += `<div class="message flex flex-row">
      <img src="https://adaptable.io/img/color logo.svg" alt="Adaptable.io logo" class="avatar">
      <div class="message-wrapper">
        <p class="message-header">
          <span class="username font-600">${escape("Adaptable.io")}</span>
          <span class="sent-date font-300">${moment(new Date("1/1/2022")).format('MMM Do, hh:mm:ss')}</span>
        </p>
        <p class="message-content font-300">
          <img src="https://adaptable.io/img/party-popper.svg" width="20em">
          Congratulations on logging in to your chat starter app.
          <img src="https://adaptable.io/img/party-popper.svg" width="20em">
          <br />
          Wondering what's next? Go to the <a target="_blank" href="https://adaptable.io/docs/starters/feathers-chat-starter#what-s-next">starter guide</a> to find how to:
          <ul>
            <li>
              <a target="_blank" href="https://adaptable.io/docs/starters/feathers-chat-starter#idea-2-deploy-a-code-update">Deploy a code update</a> by removing this message and the one from the login page.
            </li>
            <li>
              <a target="_blank" href="https://adaptable.io/docs/starters/feathers-chat-starter#idea-3-configure-environment-variables">Learn how to configure environment variables</a> by enabling GitHub Authentication for this app.
            </li>
            <li>
              <a target="_blank" href="https://adaptable.io/docs/starters/feathers-chat-starter#idea-4-start-building-your-app-by-adding-feathers-api-services">Make this app your own</a> by adding new API services.
            </li>
          </ul>
        </p>
      </div>
    </div>
    `
  }
  /* REMOVE MESSAGE END */

  // We want to show the newest message last
  messages.data.reverse().forEach(addMessage);

  // Find all users
  const users = await client.service('users').find();

  // Add each user to the list
  users.data.forEach(addUser);
};

// Retrieve email/password object from the login/signup page
const getCredentials = () => {
  const user = {
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value
  };

  return user;
};

// Log in either using the given email/password or the token from storage
const login = async credentials => {
  try {
    if(!credentials) {
      // Try to authenticate using an existing token
      await client.reAuthenticate();
    } else {
      // Otherwise log in with the `local` strategy using the credentials we got
      await client.authenticate({
        strategy: 'local',
        ...credentials
      });
    }

    // If successful, show the chat page
    showChat();
  } catch(error) {
    // If we got an error, show the login page
    showLogin(error);
  }
};

const addEventListener = (selector, event, handler) => {
  document.addEventListener(event, async ev => {
    if (ev.target.closest(selector)) {
      handler(ev);
    }
  });
};

// "Signup and login" button click handler
addEventListener('#signup', 'click', async () => {
  // For signup, create a new user and then log them in
  const credentials = getCredentials();
    
  // First create the user
  await client.service('users').create(credentials);
  // If successful log them in
  await login(credentials);
});

// "Login" button click handler
addEventListener('#login', 'click', async () => {
  const user = getCredentials();

  await login(user);
});

// "Logout" button click handler
addEventListener('#logout', 'click', async () => {
  await client.logout();
    
  document.getElementById('app').innerHTML = loginHTML;
});

// "Send" message form submission handler
addEventListener('#send-message', 'submit', async ev => {
  // This is the message text input field
  const input = document.querySelector('[name="text"]');

  ev.preventDefault();

  // Create a new message and then clear the input field
  await client.service('messages').create({
    text: input.value
  });

  input.value = '';
});

// Listen to created events and add the new message in real-time
client.service('messages').on('created', addMessage);

// We will also see when new users get created in real-time
client.service('users').on('created', addUser);

// Call login right away so we can show the chat window
// If the user can already be authenticated
login();