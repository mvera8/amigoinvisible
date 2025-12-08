import { Button, Card, Group, Text } from '@mantine/core'
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export const CardGroup = ({ grupo }) => {
	return (
		<Card shadow="sm" padding="md" radius="md" withBorder>
			<Group justify="space-between" mb="xs">
        <Text fw={500}>
					{grupo.name || JSON.stringify(grupo)}
				</Text>
      </Group>
			<Button
				component={Link}
				to={`/${grupo.$id}`}
				>Ver Grupo</Button>
		</Card>
	)
}

CardGroup.propTypes = {
  grupo: PropTypes.shape({
    $id: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
};
