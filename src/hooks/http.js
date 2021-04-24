// Custom hook
import {useReducer, useCallback} from "react";

const initialState = {
	loading: false,
	error: null,
	data: null,
	// Мы ввели дополнительный пареметр для hook, чтобы
	// не делать chaining в самом компоненте, использующем
	// данный hook, чтобы через chaining находить id и обрабатывать
	// ответ сервера, extra делает использование hook
	// более гибким и независимым
	extra: null,
	// та же логика, что и с extra
	identifier: null
}

const httpReducer = (curHttpState, action) => {
	switch (action.type) {
		case 'SEND':
			return {
				loading: true,
				error: null,
				data: null,
				extra: null,
				identifier: action.identifier
			};
		case 'RESPONSE':
			return {
				...curHttpState,
				loading: false,
				data: action.responseData,
				extra: action.extra
			};
		case 'ERROR':
			return {loading: false, error: action.errorData};
		case 'CLEAR':
			return initialState;
		default: throw new Error('Should not be reached!');
	}
};

const useHttp = () => {
	const [httpState, dispatchHttp] = useReducer(httpReducer, initialState);

	const clear = useCallback(() => dispatchHttp({type: 'CLEAR'}), []);

	const sendRequest = useCallback((url, method, body, extra, reqIdentifier) => {
		dispatchHttp({type: 'SEND', identifier: reqIdentifier});
		// Обязательно должно быть окончание .json в url, иначе получим CORS-POLICY
		fetch(url, {
			method: method,
			body: body,
			headers: {
				'Content-Type': 'application/json'
			}
		})
				.then(response => {
					return response.json();
				})
				.then(responseData => {
					// setIsLoading(false);
					dispatchHttp({type: 'RESPONSE', responseData: responseData, extra: extra});
				})
				.catch(error => {
					// setError(error.message);
					dispatchHttp({type: 'ERROR', errorData: error.message});
				});
	}, []);

	return {
		isLoading: httpState.loading,
		data: httpState.data,
		error: httpState.error,
		sendRequest: sendRequest,
		extra: httpState.extra,
		identifier: httpState.identifier,
		clear: clear
	};
};

export default useHttp;