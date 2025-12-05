import { Button, Container, Group, Title, Tooltip } from '@mantine/core'
import { useAuthContext } from '../context/AuthContext';

export const Navbar = () => {
	const { user, logout } = useAuthContext();

	return (
		<Container py="sm">
			<Group justify="space-between">
				<Title order={1}>Amistiky</Title>
			
				<Button.Group>
					<Button component="a" href="/">Incio</Button>
					{user ? (
						<>
							<Button component="a" href="/create">Crear Grupo</Button>
							<Tooltip label={user.email}>
								<Button component="a" href="/profile">Perfil</Button>
							</Tooltip>
							<Button onClick={logout}>Logout</Button>
						</>
					) : (
						<>
							<Button component="a" href="/login">Login</Button>
							<Button component="a" href="/register">Register</Button>
						</>
					)}
				</Button.Group>
			</Group>
		</Container>
	)
}
