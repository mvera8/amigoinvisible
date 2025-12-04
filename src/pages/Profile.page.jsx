import { Navbar } from '../components/Navbar';
import { Container, List, Title, Text } from '@mantine/core';
import { useAuthContext } from '../context/AuthContext';

export const ProfilePage = () => {
	const { user } = useAuthContext();

	return (
		<>
			<Navbar />
			<Container>
				<Title order={2}>Perfil</Title>

				<List mt="md">
					<List.Item>
						<Text span fw={700}>ID:</Text> {user.$id}
					</List.Item>
					<List.Item>
						<Text span fw={700}>Nombre:</Text> {user.name || 'Sin nombre'}
					</List.Item>
					<List.Item>
						<Text span fw={700}>Email:</Text> {user.email}
					</List.Item>
					<List.Item>
						<Text span fw={700}>Fecha de registro:</Text> {new Date(user.registration).toLocaleDateString()}
					</List.Item>
				</List>
			</Container>
		</>
	);
};