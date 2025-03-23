
    <h1>User Authentication API</h1>

    <h2>Overview</h2>
    <p>This API provides user authentication functionalities, including Signup, Login, and Forgot Password operations.</p>

    <h2>Base URL</h2>
    <pre>http://localhost:5000/api/user</pre>

    <h2>Endpoints</h2>

    <h3>1. User Signup</h3>
    <p><strong>Endpoint:</strong> POST /signup</p>
    <p><strong>Description:</strong> Registers a new user.</p>

    <h4>Request Body:</h4>
    <pre>
{
  "name": "string",
  "email": "string (email format)",
  "password": "string (password format)"
}
    </pre>

    <h4>Required Fields:</h4>
    <ul>
        <li><code>name</code></li>
        <li><code>email</code></li>
        <li><code>password</code></li>
    </ul>

    <h4>Responses:</h4>
    <ul>
        <li><code>201</code>: User registered successfully</li>
        <li><code>400</code>: Bad request (Validation error)</li>
        <li><code>409</code>: User already exists</li>
    </ul>

    <h3>2. User Login</h3>
    <p><strong>Endpoint:</strong> POST /login</p>
    <p><strong>Description:</strong> Authenticates a user and returns a JWT token.</p>

    <h4>Request Body:</h4>
    <pre>
{
  "email": "string (email format)",
  "password": "string (password format)"
}
    </pre>

    <h4>Required Fields:</h4>
    <ul>
        <li><code>email</code></li>
        <li><code>password</code></li>
    </ul>

    <h4>Responses:</h4>
    <ul>
        <li><code>200</code>: Login successful (JWT token returned)</li>
        <li><code>401</code>: Invalid credentials</li>
    </ul>

    <h3>3. Forgot Password</h3>
    <p><strong>Endpoint:</strong> POST /forgot-password</p>
    <p><strong>Description:</strong> Sends a password reset link to the user's email.</p>

    <h4>Request Body:</h4>
    <pre>
{
  "email": "string (email format)"
}
    </pre>

    <h4>Required Fields:</h4>
    <ul>
        <li><code>email</code></li>
    </ul>

    <h4>Responses:</h4>
    <ul>
        <li><code>200</code>: Password reset link sent</li>
        <li><code>404</code>: User not found</li>
    </ul>

    <h2>Installation & Setup</h2>
    <ol>
        <li>Clone the repository:
            <pre>git clone &lt;repository_url&gt;</pre>
        </li>
        <li>Install dependencies:
            <pre>npm install</pre>
        </li>
        <li>Start the server:
            <pre>npm start</pre>
        </li>
    </ol>

    <h2>Technologies Used</h2>
    <ul>
        <li>Node.js</li>
        <li>Express.js</li>
        <li>JWT for authentication</li>
    </ul>

    <h2>License</h2>
    <p>This project is licensed under the MIT License.</p>
