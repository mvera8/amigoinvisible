import { Button, Container, Title } from "@mantine/core";
import { useAuthContext } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Each } from "../components/Each";
import { useEffect, useState } from "react";
import { databases } from "../lib/appwrite";
import { Query } from "appwrite"; // Importa Query
import { CardGroup } from "../components/CardGroup";

const documentDb = import.meta.env.VITE_APPWRITE_DATABSE;

export const HomePage = () => {
  const { user } = useAuthContext();

	const [userCreatedGroups, setUserCreatedGroups] = useState([]);
	const [userParticipantGroups, setUserParticipantGroups] = useState([]);

	// Grupos Creados por mi
	useEffect(() => {
		if (!user) return; // Asegúrate de que el usuario esté disponible
		
		const fetchCreatedGroups = async () => {
			try {
				const result = await databases.listDocuments(
					documentDb,
					import.meta.env.VITE_APPWRITE_TABLE_GRUPO,
					[
						Query.equal('ownerId', user.$id) // Filtra por ownerId
					]
				);
				// console.log('Creados por mi', result);
				setUserCreatedGroups(result.documents); // Accede a .documents
			} catch (error) {
				console.error('Error al obtener grupos creados:', error);
			}
		};

		fetchCreatedGroups();
	}, [user]);

	// Grupos Donde participo
	useEffect(() => {
		if (!user) return;
		
		const fetchParticipantGroups = async () => {
			try {
				const result = await databases.listDocuments(
					documentDb,
					import.meta.env.VITE_APPWRITE_TABLE_PARTICIPANTE,
					[
						Query.equal('userId', user.$id)
					]
				);
				console.log('donde participo', result);
				setUserParticipantGroups(result.documents);
			} catch (error) {
				console.error('Error al obtener grupos participantes:', error);
			}
		};

		fetchParticipantGroups();
	}, [user]);

  return (
    <>
			<Navbar />
			<Container>
				{user ? (
					<>
						<Title order={2}>Hola {user.name}</Title>

						{userCreatedGroups.length > 0 &&
							<>
								<Title order={3}>Grupos Creados por Mi</Title>

								<Each of={userCreatedGroups} render={(item) => (
									<CardGroup key={item.$id} grupo={item} />
								)} />
							</>
						}

						{userCreatedGroups.length > 0 &&
							<>
								<Title order={3}>Grupos donde participo</Title>

								<Each of={userParticipantGroups} render={(item) => (
									<CardGroup key={item.$id} grupo={item.amigoinvisibleGrupo} />
								)} />
							</>
						}
					</>
				) : (
					<>
						<Button component="a" href="/login">Login</Button>
						<Button component="a" href="/register">Register</Button>
					</>
				)}
			</Container>
    </>
  );
};