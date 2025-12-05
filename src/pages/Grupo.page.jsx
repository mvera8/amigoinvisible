import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Each } from '../components/Each';
import { ActionIcon, Avatar, Button, Container, Divider, Flex, Group, Kbd, List, Paper, SimpleGrid, Skeleton, Tabs, Text, Title } from '@mantine/core';
import { useAuthContext } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { get, list, create, remove } from '../lib/appwrite-helpers';
import { Query } from 'appwrite';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { IconChevronLeft, IconGift, IconGiftOff, IconUser, IconUserOff } from '@tabler/icons-react';

export const GrupoPage = () => {
	const { user } = useAuthContext();
	const { groupId } = useParams();
	const navigate = useNavigate();
	const [groupInformation, setGroupInformation] = useState(null);
	const [groupParticipants, setGroupParticipants] = useState(null);
	const [groupOwner, setGroupOwner] = useState(false);

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
					// Verificar ownership desde el cache
					setGroupOwner(cachedData.grupo.ownerId === user.$id);
				}

				// Luego hacer fetch de datos actualizados
				const grupoResult = await get(
					import.meta.env.VITE_APPWRITE_TABLE_GRUPO,
					groupId
				);

				if (grupoResult.success) {
					setGroupInformation(grupoResult.data);
					// Verificar si el usuario es el owner
					setGroupOwner(grupoResult.data.ownerId === user.$id);
				} else {
					console.error('Error al obtener grupo:', grupoResult.error);
				}

				const participantesResult = await list(
					import.meta.env.VITE_APPWRITE_TABLE_PARTICIPANTE,
					[Query.equal('amigoinvisibleGrupo', groupId)]
				);

				if (participantesResult.success) {
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
	}, [groupId, user.$id]);

	const isUserInGroup = groupParticipants?.some(p => p.userId === user.$id);

	const handleAskJoin = async () => {
		try {
			const participantData = {
				amigoinvisibleGrupo: groupId,
				userId: user.$id,
				name: user.name || '',
				email: user.email,
			};

			const result = await create(
				import.meta.env.VITE_APPWRITE_TABLE_PARTICIPANTE,
				participantData
			);

			if (result.success) {
				console.log('Participante agregado:', result.data);
				
				// Limpiar cache para forzar recarga
				localStorage.removeItem(STORAGE_KEYS.LOCALSTORAGE_GRUPO);
				
				navigate(0); // Recargar la página
			} else {
				console.error('Error al unirse al grupo:', result.error);
			}

		} catch (error) {
			console.error('Error:', error);
		}
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
							: <Title order={2} tt="capitalize">
								{groupInformation.name || 'Sin nombre'}
								<Kbd ml="sm">{groupInformation.$id}</Kbd>
							</Title>
						}
					</Flex>

					{groupOwner && (
						<Button.Group>
							<Button
								color="green"
								onClick={handleDeleteGroup}>
								Cerrar grupo
							</Button>

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
						<Title order={3} mt="lg" mb="xs">Información</Title>

						<List mt="md">
							<List.Item>
								<Text span fw={700}>ID:</Text> {groupInformation.$id}
							</List.Item>
							<List.Item>
								<Text span fw={700}>Status:</Text> {groupInformation.status}
							</List.Item>
							<List.Item>
								<Text span fw={700}>Eres el owner:</Text> {groupOwner ? 'Sí' : 'No'}
							</List.Item>
						</List>
					</>
				}

				{isUserInGroup && groupParticipants?.length > 0
					? 
						<>
							<Tabs defaultValue="participants">
								<Tabs.List>
									<Tabs.Tab value="participants">
										Participantes
									</Tabs.Tab>
									<Tabs.Tab value="invite">
										Invitar
									</Tabs.Tab>
									<Tabs.Tab value="share">
										Compartir
									</Tabs.Tab>
								</Tabs.List>

								<Tabs.Panel value="participants">
									<SimpleGrid cols={4}>
										<Each of={groupParticipants} render={(item) => (
											<Paper key={item.$id} radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
												<Avatar color="cyan" radius="xl" size="lg" mx="auto" name={item.name} />
												<Text ta="center" fz="lg" fw={500} mt="md">
													{item.name}
												</Text>
												<Text ta="center" c="dimmed" fz="sm">
													{item.email}
												</Text>
												<Avatar color="blue" radius="sm">
													<IconGift size={20} />
												</Avatar>
												<Avatar color="blue" radius="sm">
													<IconGiftOff size={20} />
												</Avatar>
												<Avatar color="blue" radius="sm">
													<IconUserOff size={20} />
												</Avatar>
												<Avatar color="blue" radius="sm">
													<IconUser size={20} />
												</Avatar>
											</Paper>
										)} />
									</SimpleGrid>
								</Tabs.Panel>

								<Tabs.Panel value="invite">
									Invitar tab content
								</Tabs.Panel>

								<Tabs.Panel value="share">
									Compartir tab content
								</Tabs.Panel>
							</Tabs>
						</>
					:
						<>
							<Divider my="xl" />
							<Text>No estás en el grupo</Text>
							<Button
								mb="md"
								onClick={handleAskJoin}>
								Pedir Unirse
							</Button>
						</>
				}
			</Container>
		</>
	)
}