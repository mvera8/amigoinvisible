import { useAuthContext } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Button, Container, TextInput, Title } from "@mantine/core";
import { create, remove } from '../lib/appwrite-helpers';
import { hasLength, useForm } from "@mantine/form";

export const CrearGrupoPage = () => {
  const { user } = useAuthContext();

	const form = useForm({
		mode: 'controlled',
		initialValues: { name: '' },
		validate: {
			name: hasLength({ min: 3 }, 'Debe tener al menos 3 caracteres.'),
		},
	});

	const handleCreateGroup = async (values) => {
		try {
			// 1. Crear el grupo
			const grupoResult = await create(
				import.meta.env.VITE_APPWRITE_TABLE_GRUPO,
				{
					name: values.name,
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
					name: user.name || '',
					email: user.email,
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
		}
	};

  // Si user es null, ya se redirigió arriba
  return (
    <>
      <Navbar />
      <Container size="xs" pt="xl">
        <Title order={2}>Crear Grupo</Title>
				<form onSubmit={form.onSubmit(handleCreateGroup)}>
					<TextInput
						{...form.getInputProps('name')}
						label="Nombre del grupo"
						withAsterisk
						placeholder="Ej: Los Vengadores"
						mb="md"
					/>
					<Button type="submit">Crear Grupo</Button>
				</form>
      </Container>
    </>
  );
};