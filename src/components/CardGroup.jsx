import { Badge, Button, Card, Group, Text } from '@mantine/core'
import PropTypes from "prop-types";

export const CardGroup = ({ grupo }) => {
	return (
		<Card shadow="sm" padding="md" radius="md" withBorder>
			<Group justify="space-between" mb="xs">
        <Text fw={500}>
					{grupo.name || JSON.stringify(grupo)}
				</Text>
				<Badge variant="dot" color={grupo.status == 'open' ? "green" : 'red'}>{grupo.status == 'open' ? 'Abierto' : 'Cerrado'}</Badge>
      </Group>
			<Button color="blue" fullWidth mt="md" radius="md">
        Ver grupo
      </Button>
		</Card>
	)
}

CardGroup.propTypes = {
	grupo: PropTypes.node,
};