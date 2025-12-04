import { Children } from 'react'
import PropTypes from 'prop-types';

export const Each = ({render, of}) => Children.toArray(of.map((item,index) => render(item,index)));

Each.propTypes = {
	render: PropTypes.func.isRequired,
	of: PropTypes.array.isRequired,
};