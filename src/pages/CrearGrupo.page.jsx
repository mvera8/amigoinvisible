import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { ID } from "appwrite";
import { databases } from "../lib/appwrite";
import { Navbar } from "../components/Navbar";
import { Button, CloseButton, Container, TextInput, Title } from "@mantine/core";

const databaseId = import.meta.env.VITE_APPWRITE_DATABSE;

export const CrearGrupoPage = () => {
  const { user } = useAuthContext();

  const [nombre, setNombre] = useState("");
  const [error, setError] = useState("");

  const handleCrear = async () => {
  setError("");

  if (!nombre.trim()) {
    setError('Por favor ingresa un nombre para el grupo');
    return;
  }

  try {
    // 1. Crear el grupo
    const groupData = {
      name: nombre,
      ownerId: user.$id,
    };

    const groupResponse = await databases.createDocument(
      databaseId,
      import.meta.env.VITE_APPWRITE_TABLE_GRUPO,
      ID.unique(),
      groupData
    );

    if (!groupResponse || !groupResponse.$id) {
      throw new Error('No se pudo crear el grupo');
    }

    console.log('Grupo creado:', groupResponse);

    // 2. Agregar al creador como participante
    const participantData = {
      amigoinvisibleGrupo: groupResponse.$id,
      userId: user.$id,
    };

    try {
      const participantResponse = await databases.createDocument(
        databaseId,
        import.meta.env.VITE_APPWRITE_TABLE_PARTICIPANTE,
        ID.unique(),
        participantData
      );

      console.log('Participante agregado:', participantResponse);
      
      // 3. Redirigir al home solo si todo salió bien
      window.location.href = "/";
      
    } catch (participantError) {
      // Si falla agregar participante, eliminar el grupo creado
      console.error('Error al agregar participante, eliminando grupo...', participantError);
      
      try {
        await databases.deleteDocument(
          databaseId,
          import.meta.env.VITE_APPWRITE_TABLE_GRUPO,
          groupResponse.$id
        );
        console.log('Grupo eliminado exitosamente');
      } catch (deleteError) {
        console.error('Error al eliminar grupo:', deleteError);
      }
      
      throw new Error('No se pudo agregar como participante. El grupo no fue creado.');
    }

  } catch (error) {
    console.error('Error al crear grupo:', error);
    setError(error.message || 'Hubo un error. Intenta nuevamente');
  }
};

  // Evita parpadeo mientras la sesión carga
  if (user === undefined) {
    return <p>Cargando...</p>;
  }

  // Si user es null, ya se redirigió arriba
  return (
    <>
      <Navbar />
      <Container>
        <Title order={2}>Crear Grupo</Title>

        <TextInput
          label="Nombre del grupo"
          withAsterisk
          placeholder="Ej: Los Vengadores"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            if (error) setError(""); // Limpiar error al escribir
          }}
          rightSectionPointerEvents="all"
          mb="md"
          rightSection={
            nombre && (
              <CloseButton
                aria-label="Clear input"
                onClick={() => {
                  setNombre('');
                  setError('');
                }}
              />
            )
          }
          error={error}
        />

        <Button
          onClick={handleCrear}
          variant="filled"
          size="md">Crear Grupo</Button>
      </Container>
    </>
  );
};