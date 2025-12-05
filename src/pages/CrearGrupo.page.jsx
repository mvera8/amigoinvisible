import { useState } from "react";
import { useAuthContext } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Button, CloseButton, Container, TextInput, Title } from "@mantine/core";
import { create, remove } from '../lib/appwrite-helpers';

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
			const grupoResult = await create(
				import.meta.env.VITE_APPWRITE_TABLE_GRUPO,
				{
					name: nombre,
					ownerId: user.$id,
				}
			);

			if (!grupoResult.success) {
				throw new Error(grupoResult.error || 'No se pudo crear el grupo');
			}

			const grupoId = grupoResult.data.$id;
			console.log('Grupo creado:', grupoResult.data);

			// 2. Agregar al creador como participante
			const participanteResult = await create(
				import.meta.env.VITE_APPWRITE_TABLE_PARTICIPANTE,
				{
					amigoinvisibleGrupo: grupoId,
					userId: user.$id,
					name: user.name || '',
					email: user.email,
					status: 'in'
				}
			);

			if (!participanteResult.success) {
				// Rollback: eliminar el grupo
				console.error('Error al agregar participante, eliminando grupo...');
				await remove(
					import.meta.env.VITE_APPWRITE_TABLE_GRUPO,
					grupoId
				);
				throw new Error('No se pudo agregar como participante. El grupo no fue creado.');
			}

			console.log('Participante agregado:', participanteResult.data);
			window.location.href = "/";

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
      <Container size="xs" pt="xl">
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