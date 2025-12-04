import { useState } from "react";
import { TextInput, Button } from "@mantine/core";
import { account } from "../lib/appwrite";
import { ID } from "appwrite";
import { useAuthContext } from "../context/AuthContext";

export const RegisterPage = () => {
  const { setUser } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      // Crear usuario
      await account.create(ID.unique(), email, password);

      // Crear sesión automática (login post-registro)
      await account.createEmailPasswordSession(email, password);

      // Obtener usuario actual
      const current = await account.get();
      setUser(current);

      alert("Registro exitoso!");
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      alert("Error registrando usuario");
    }
  };

  return (
    <div>
      <h2>Registro</h2>

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

      <Button fullWidth onClick={handleRegister}>
        Crear cuenta
      </Button>
    </div>
  );
};
