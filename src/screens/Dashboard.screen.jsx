import { useAuthContext } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { list } from "../lib/appwrite-helpers";
import { Query } from "appwrite";

import { Button, Card, Container, Flex, Skeleton, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { CardGroup, Each } from '../components';

export const DashboardScreen = () => {
	const { user } = useAuthContext();

	const [loading, setLoading] = useState(true);
	const [userGroups, setUserGroups] = useState([]);
	const [userParticipations, setUserParticipations] = useState([]);

	useEffect(() => {
		if (!user) return;

		const fetchData = async () => {
			try {
				setLoading(true);

				const [created, participations] = await Promise.all([
					list(import.meta.env.VITE_APPWRITE_TABLE_GRUPO, [
						Query.equal("ownerId", user.$id),
					]),
					list(import.meta.env.VITE_APPWRITE_TABLE_PARTICIPANTE, [
						Query.equal("userId", user.$id),
					]),
				]);

				if (created.success) setUserGroups(created.data.documents);
				if (participations.success)
					setUserParticipations(participations.data.documents);

			} catch (err) {
				console.error("Error en Dashboard:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user]);

	return (
		<Container pt="xl">
			<Title order={1} mb="md">Hola {user.name || user.email}</Title>

			{/* LOADER INICIAL */}
			{loading && (
				<>
					<Skeleton height={194} mb="lg" />
				</>
			)}

			{/* VACÍO → CREAR PRIMER GRUPO */}
			{!loading && userGroups.length === 0 && (
				<Card withBorder radius="md" padding="xl">
					<Flex
						gap="md"
						justify="center"
						align="center"
						direction="column"
					>
						<Text fz="xs" tt="uppercase" fw={700} c="dimmed" ta="center">
							Bienvenido
						</Text>
						<Text fz="lg" tt="capitalize" fw={500} ta="center">
							Crea tu primer Amigo Invisible
						</Text>
						<Button component={Link} to={`/create`} size='lg'>
							Crear Grupo
						</Button>
					</Flex>
				</Card>
			)}

			{/* GRUPOS CREADOS */}
			{!loading && userGroups.length > 0 && (
				<>
					<Title order={3} mt="lg" mb="xs">Grupos Creados por Mi</Title>
					<Each of={userGroups} render={(g) => (
						<CardGroup key={g.$id} grupo={g} />
					)} />
				</>
			)}

			{/* GRUPOS DONDE PARTICIPA */}
			{!loading && userParticipations.length > 0 && (
				<>
					<Title order={3} mt="lg" mb="xs">Grupos donde participo</Title>
					<Each of={userParticipations} render={(p) => (
						<CardGroup key={p.$id} grupo={p.amigoinvisibleGrupo} />
					)} />
				</>
			)}
		</Container>
	);
};
