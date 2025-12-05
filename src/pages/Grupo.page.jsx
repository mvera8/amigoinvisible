import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Each } from '../components/Each';
import { Avatar, Container, List, Paper, SimpleGrid, Text, Title } from '@mantine/core';
import { useAuthContext } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';

export const GrupoPage = () => {
	const { user } = useAuthContext();
	const { groupId } = useParams();
	// console.log('groupId', groupId);
	const [groupIformation, setGroupIformation] = useState(null);
	const [groupParticipants, setGroupParticipants] = useState(null);

	// Grupos Creados por mi
	useEffect(() => {		
		const fetchGroupInformation = async () => {
			try {
				const listGroupInformation = await databases.listDocuments(
					import.meta.env.VITE_APPWRITE_DATABSE,
					import.meta.env.VITE_APPWRITE_TABLE_GRUPO,
					[Query.equal('$id', groupId)]
				);

				const group = listGroupInformation.documents[0] || null;
				setGroupIformation(group);

				if (!group) return; // No existe el grupo → listo

				const listGroupParticipants = await databases.listDocuments(
					import.meta.env.VITE_APPWRITE_DATABSE,
					import.meta.env.VITE_APPWRITE_TABLE_PARTICIPANTE,
					[Query.equal('amigoinvisibleGrupo', group.$id)]
				);

				setGroupParticipants(listGroupParticipants.documents || []);

			} catch (error) {
				console.error("Error:", error);
			}
		};

		fetchGroupInformation();
	}, [groupId]);

	return (
		<>
			<Navbar />
			<Container pt="xl">
				<Title order={2}>Grupo</Title>

				{groupIformation &&
					<>
						<Title order={3} mt="lg" mb="xs">Información</Title>

						<List mt="md">
							<List.Item>
								<Text span fw={700}>ID:</Text> {groupIformation.$id}
							</List.Item>
							<List.Item>
								<Text span fw={700}>Nombre:</Text> {groupIformation.name || 'Sin nombre'}
							</List.Item>
							<List.Item>
								<Text span fw={700}>Status:</Text> {groupIformation.status}
							</List.Item>
						</List>
					</>
				}

				{groupParticipants?.length > 0 && (
					<>
						<Title order={3} mt="lg" mb="xs">Participantes</Title>

						<SimpleGrid cols={4}>
							<Each of={groupParticipants} render={(item) => (
								<Paper key={item.$userId} radius="md" withBorder p="lg" bg="var(--mantine-color-body)">
									<Avatar color="cyan" radius="xl" size="lg" mx="auto" name={item.name} />
									<Text ta="center" fz="lg" fw={500} mt="md">
										{item.name}
									</Text>
									<Text ta="center" c="dimmed" fz="sm">
										{item.email}
									</Text>
								</Paper>
							)} />
						</SimpleGrid>
					</>
				)}
				
				
			</Container>
		</>
	)
}
