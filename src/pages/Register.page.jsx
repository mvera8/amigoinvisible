import { useState } from "react";
import { TextInput, Button, Title, Container } from "@mantine/core";
import { account } from "../lib/appwrite";
import { ID } from "appwrite";
import { useAuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export const RegisterPage = () => {
  const { setUser } = useAuthContext();
  const [name, setName] = useState("");
	const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      // Crear usuario
      await account.create(
				ID.unique(),
				email,
				password,
				name // opcional pero útil
			);

      // Crear sesión automática (login post-registro)
      await account.createEmailPasswordSession(email,password);

      // Obtener usuario actual
      const current = await account.get();
      setUser(current);

      alert("Registro exitoso!");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <Container size="xs" pt="xl">
      <Title order={2}>Registro</Title>

			<TextInput
        label="Nombre"
        value={name}
        onChange={(e) => setName(e.target.value)}
        mb="md"
      />

      <TextInput
        label="Email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        mb="md"
      />

      <TextInput
        label="Password"
        type="password"
        placeholder="********"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        mb="md"
      />

      <Button
				mb="md"
				fullWidth
				onClick={handleRegister}>
        Crear cuenta
      </Button>

			<Button
				mb="md"
				variant="light"
				color="gray"
				component={Link}
				to={`/login`}
				fullWidth>Ingresar</Button>
    </Container>
  );
};
