import React, { useState, useEffect } from "react";

const SubscribePage: React.FC = () => {
  // 👇 track form state
  const [username, setusername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // 👇 state to show the result after submitting
  const [result, setResult] = useState<any>();

  // 👇 submit handler
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    // 👇 encode the data to application/x-www-form-urlencoded type
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    console.log(formData);

    // 👇 call backend endpoint using fetch API
    fetch("/api/bearer", {
      body: formData.toString(),
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    })
      .then(async (response) => {
        // 👇 modify the state to show the result
        setResult(await response.json());
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="container mx-auto">
      <h1>Sign in with urs.earthdata.nasa.gov</h1>
      {/* 👇 wire-up the handleSubmit handler */}
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          placeholder="Enter your username"
          name="username"
          // 👇 wire-up the controlled state
          value={username}
          onChange={(e) => setusername(e.target.value)}
        />
        <label htmlFor="password">Password:</label>
        <input
          name="password"
          // 👇 wire-up the controlled state
          value={password}
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {/* show the data returned by the api */}
      <div>
        Result:
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
};

export default SubscribePage;