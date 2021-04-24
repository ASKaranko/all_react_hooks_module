import React, {useState} from 'react';

export const AuthContext = React.createContext({
	isAuth: false,
	login: () => {},
});

const AuthContextProvider = props => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const loginHandler = () => {
		setIsAuthenticated(true);
	};

	return (
			// компонент, который слушает Provider, получит
			// обновленное значение value, как только оно поменяется
		<AuthContext.Provider value={{
			login: loginHandler,
			isAuth: isAuthenticated
		}}>
			{props.children}
		</AuthContext.Provider>
	);
};

export default AuthContextProvider;