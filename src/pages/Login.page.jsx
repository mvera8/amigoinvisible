import { useState } from "react";
import { TextInput, Button } from "@mantine/core";
import { account } from "../lib/appwrite";
import { useAuthContext } from "../context/AuthContext";

export const LoginPage = () => {
  const { setUser } = useAuthContext();
  const [email, setEmail] = useState("email@example.com");
  const [password, setPassword] = useState("12345678");

  const handleLogin = async () => {
    try {
      await account.createEmailPasswordSession(email, password);
      const current = await account.get();
      setUser(current);
      window.location.href = "/";
    } catch (err) {
      alert("Email o contraseña incorrectos");
    }
  };

  return (
    <div style={{ maxWidth: 300, margin: "40px auto" }}>
      <h2>Login</h2>

      <TextInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} mb="md" />
      <TextInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} mb="md" />

      <Button fullWidth onClick={handleLogin}>Ingresar</Button>
    </div>
  );
};
