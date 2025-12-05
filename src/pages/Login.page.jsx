import { useState } from "react";
import { TextInput, Button, Container, Title } from "@mantine/core";
import { account } from "../lib/appwrite";
import { useAuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const LoginPage = () => {
  const { setUser } = useAuthContext();
  const [email, setEmail] = useState("email@example.com");
  const [password, setPassword] = useState("12345678");
	const [error, setError] = useState("");

  const handleLogin = async () => {
		setError("");

    try {
      await account.createEmailPasswordSession(email, password);
      const current = await account.get();
      setUser(current);
      window.location.href = "/";
    } catch (err) {
      console.error('Email o contraseña incorrectos', error);
      setError(error.message || 'Hubo un error. Intenta nuevamente');
    }
  };

  return (
    <Container size="xs" pt="xl">
      <Title order={2}>Login</Title>

      <TextInput
				mb="md"
				label="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				error={error}
			/>
      <TextInput
				mb="md"
				label="Password"
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				error={error}
			/>

			<Button
				mb="md"
				fullWidth
				onClick={handleLogin}>
        Ingresar
      </Button>

			<Button
				mb="md"
				variant="light"
				color="gray"
				component={Link}
				to={`/register`}
				fullWidth>Registrarse</Button>
    </Container>
  );
};
