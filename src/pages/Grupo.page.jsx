import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Each } from '../components/Each';
import { ActionIcon, Button, Container, Flex, Group, Kbd, List, Skeleton, Table, Text, TextInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { create, get, list, remove } from '../lib/appwrite-helpers';
import { Query } from 'appwrite';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { IconChevronLeft } from '@tabler/icons-react';
import { hasLength, isEmail, useForm } from '@mantine/form';
import { useLocalStorage } from '@mantine/hooks';
import { useAuthContext } from '../context/AuthContext';

export const GrupoPage = () => {
	const { user } = useAuthContext();
	const { groupId } = useParams();
	const navigate = useNavigate();
	const [groupInformation, setGroupInformation] = useState(null);
	const [groupParticipants, setGroupParticipants] = useState([]);
	const [groupOwner, setGroupOwner] = useState(false);
	const [groupGuests, setGroupGuests] = useLocalStorage({
		key: STORAGE_KEYS.LOCALSTORAGE_GUEST,
		defaultValue: [],
	});

	// Add guests
	const form = useForm({
    mode: 'controlled',
    initialValues: { name: '', email: '' },
    validate: {
      name: hasLength({ min: 3 }, 'Debe tener al menos 3 caracteres.'),
      email: isEmail('Correo electrónico no válido'),
    },
  });

	// Obtener grupo info y participantes
	useEffect(() => {
		const fetchGroupInformation = async () => {
			try {
				// Intentar cargar desde localStorage
				const cached = localStorage.getItem(STORAGE_KEYS.LOCALSTORAGE_GRUPO);
				const cachedData = cached ? JSON.parse(cached) : null;

				// Si existe cache Y es del mismo grupo, cargarlo primero
				if (cachedData && cachedData.groupId === groupId) {
					console.log('Cargando desde cache...');
					setGroupInformation(cachedData.grupo);
					setGroupParticipants(cachedData.participantes);
				}

				// Luego hacer fetch de datos actualizados
				const grupoResult = await get(
					import.meta.env.VITE_APPWRITE_TABLE_GRUPO,
					groupId
				);

				if (grupoResult.success) {
					setGroupInformation(grupoResult.data);
				} else {
					console.error('Error al obtener grupo:', grupoResult.error);
				}

				const participantesResult = await list(
					import.meta.env.VITE_APPWRITE_TABLE_PARTICIPANTE,
					[Query.equal('amigoinvisibleGrupo', groupId),]
				);

				if (participantesResult.success) {
					// console.log('participantesResult', participantesResult);
					setGroupParticipants(participantesResult.data.documents);

					// Solo guardar si es un grupo diferente al que está en cache
					if (!cachedData || cachedData.groupId !== groupId) {
						const dataToSave = {
							groupId: groupId,
							grupo: grupoResult.data,
							participantes: participantesResult.data.documents,
							timestamp: Date.now()
						};
						localStorage.setItem(STORAGE_KEYS.LOCALSTORAGE_GRUPO, JSON.stringify(dataToSave));
					}
				} else {
					console.error('Error al obtener participantes:', participantesResult.error);
				}

			} catch (error) {
				console.error("Error:", error);
			}
		};

		fetchGroupInformation();
	}, [groupId]);

	useEffect(() => {
		if (!user || !groupInformation) {
			setGroupOwner(false);
			return;
		}

		setGroupOwner(groupInformation.ownerId === user.$id);
	}, [user, groupInformation]);

	const handleAppendGuest = async (values) => {		
		// Crear un nuevo guest con los valores del formulario
		const newGuest = {
			name: values.name,
			email: values.email,
		};
		
		// Agregar el nuevo guest al array existente
		const updatedGuests = [...groupGuests, newGuest];
		setGroupGuests(updatedGuests);
		
		// Resetear el formulario
		form.reset();
	};

	const handleDeleteGroup = async () => {
		if (!groupOwner) {
			console.error('Solo el owner puede eliminar el grupo');
			return;
		}

		// Opcional: agregar confirmación
		if (!window.confirm('¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.')) {
			return;
		}

		try {
			// 1. Primero eliminar todos los participantes
			if (groupParticipants && groupParticipants.length > 0) {
				for (const participant of groupParticipants) {
					const deleteParticipantResult = await remove(
						import.meta.env.VITE_APPWRITE_TABLE_PARTICIPANTE,
						participant.$id
					);
					
					if (!deleteParticipantResult.success) {
						console.error('Error al eliminar participante:', deleteParticipantResult.error);
					}
				}
			}

			// 2. Luego eliminar el grupo
			const deleteGroupResult = await remove(
				import.meta.env.VITE_APPWRITE_TABLE_GRUPO,
				groupId
			);

			if (deleteGroupResult.success) {
				console.log('Grupo eliminado exitosamente');
				
				// Limpiar cache
				localStorage.removeItem(STORAGE_KEYS.LOCALSTORAGE_GRUPO);
				
				// Redirigir al home
				navigate('/');
			} else {
				console.error('Error al eliminar grupo:', deleteGroupResult.error);
				alert('Hubo un error al eliminar el grupo');
			}

		} catch (error) {
			console.error('Error al eliminar grupo:', error);
			alert('Hubo un error al eliminar el grupo');
		}
	};

	const handleSendInvitations = async () => {
		console.log('handleSendInvitations');

		if (groupGuests.length === 0) {
			alert('No hay invitados para enviar');
			return;
		}

		try {
			// Recorrer cada guest y crear un participante
			for (const guest of groupGuests) {
				const participantData = {
					amigoinvisibleGrupo: groupId,
					name: guest.name,
					email: guest.email,
				};

				const result = await create(
					import.meta.env.VITE_APPWRITE_TABLE_PARTICIPANTE,
					participantData
				);

				if (result.success) {
					console.log('Participante agregado:', result.data);
				} else {
					console.error('Error al agregar participante:', result.error);
					alert(`Error al agregar a ${guest.name}`);
					return; // Detener si hay un error
				}
			}

			// Si todo salió bien, limpiar y recargar
			alert('¡Invitaciones enviadas exitosamente!');
			
			// Limpiar cache para forzar recarga
			localStorage.removeItem(STORAGE_KEYS.LOCALSTORAGE_GRUPO);
			localStorage.removeItem(STORAGE_KEYS.LOCALSTORAGE_GUEST);
			
			// Limpiar el estado de guests
			setGroupGuests([]);
			
			// Recargar la página para mostrar los nuevos participantes
			navigate(0);
		} catch (error) {
			console.error('Error:', error);
			alert('Hubo un error al enviar las invitaciones');
		}
	};

	return (
		<>
			<Navbar />
			<Container pt="xl">
				<Group justify="space-between">
					<Flex
						gap="md"
						justify="flex-start"
						align="center"
						direction="row"
						wrap="wrap"
					>
						<ActionIcon variant="transparent" color='dark' aria-label="Back">
							<IconChevronLeft size={22} />
						</ActionIcon>

						{!groupInformation
							? <Skeleton height={8} width={150} />
							: <Flex
								gap="sm"
								justify="flex-start"
								align="center"
								direction="row"
								wrap="wrap"
							>
								<Title order={2} tt="capitalize">{groupInformation.name || 'Sin nombre'}</Title>
								<Kbd>{groupInformation.$id}</Kbd>
							</Flex>
						}
					</Flex>

					{groupOwner && (
						<Button.Group>
							<Button
								color="red"
								onClick={handleDeleteGroup}>
								Borrar grupo
							</Button>
						</Button.Group>
					)}
				</Group>		

				{groupInformation &&
					<>
						<List mt="md">
							<List.Item>
								<Text span fw={700}>Eres el owner:</Text> {groupOwner ? 'Sí' : 'No'}
							</List.Item>
						</List>
					</>
				}

				{groupOwner && (
					<>
						<form onSubmit={form.onSubmit(handleAppendGuest)}>
							<TextInput {...form.getInputProps('name')} label="Name" placeholder="Name" />
							<TextInput {...form.getInputProps('email')} mt="md" label="Email" placeholder="Email" />
							<Button type="submit" mt="md">Agregar</Button>
						</form>

						<Table mb="md">
						<Table.Thead>
							<Table.Tr>
								<Table.Th>Nombre</Table.Th>
								<Table.Th>Email</Table.Th>
								<Table.Th>Invitados</Table.Th>
								<Table.Th>Acciones</Table.Th>
							</Table.Tr>
						</Table.Thead>
						<Table.Tbody>
							

							<Each of={groupGuests} render={(item) => (
								<Table.Tr key={item.$id}>
									<Table.Td>{item.name}</Table.Td>
									<Table.Td>{item.email}</Table.Td>
									<Table.Td>No</Table.Td>
									<Table.Td>#</Table.Td>
								</Table.Tr>
							)} />

								<Each of={groupParticipants} render={(item) => (
									<Table.Tr key={item.$id}>
										<Table.Td>{item.owner && '⭐'} {item.name}</Table.Td>
										<Table.Td>{item.email}</Table.Td>
										<Table.Td>Si</Table.Td>
									</Table.Tr>
								)} />
							</Table.Tbody>
						</Table>

						<Button
							color="green"
							size="lg"
							onClick={handleSendInvitations}>
							Enviar Invitaciones
						</Button>

						</>
				)}

				
				

				
			</Container>
		</>
	)
}