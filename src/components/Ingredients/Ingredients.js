import React, {useReducer, useEffect, useCallback, useMemo} from 'react';
import IngredientForm from './IngredientForm';
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import useHttp from "../../hooks/http";
import Search from './Search';

// const [state, dispatch] = useReducer(reducer, initialArg, init);
// Альтернатива для useState. Принимает редюсер типа (state, action) =>
// newState и возвращает текущее состояние в паре с методом dispatch

// Хук useReducer обычно предпочтительнее useState, когда у вас сложная
// логика состояния, которая включает в себя несколько значений, или когда
// следующее состояние зависит от предыдущего. useReducer также позволяет
// оптимизировать производительность компонентов, которые запускают глубокие
// обновления, поскольку вы можете передавать dispatch вместо колбэков

// React гарантирует, что идентичность функции dispatch стабильна и не
// изменяется при повторных рендерах. Поэтому её можно безопасно не включать
// в списки зависимостей хуков useEffect и useCallback

// Reducer желательно вставлять до самого компонента,
// потому что он независит от его рендера, это отдельная функция,
// за исключением случаев, когда в нем не используются props компонента,
// но инициализировать его нужно в компоненте в корне
// currentIngredients = old state

// Как только useReducer возвращает новое состояние,
// REACT ДЕЛАЕТ RERENDER OF THE COMPONENT!!!
const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case 'SET':
      return action.ingredients;
    case 'ADD':
      return [...currentIngredients, action.ingredient];
    case 'DELETE':
      return currentIngredients.filter(ing => ing.id !== action.id);
    default: throw new Error('Should not get there');
  }
};



const Ingredients = () => {
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  // custom hook также вызывает rerender компонента Ingredients
  // после отправки запроса на сервер, так как Ingredients его использует
  const {isLoading, error, data, sendRequest, extra, identifier, clear} = useHttp();
  // const [userIngredients, setUserIngredients] = useState([]);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState();

  // Почему нельзя запрашивать первоначальные ингредиеты в корне компонента?
  // Потому что это вызовет infinite loop, мы будем делать fetch, затем делать setUserIngredients,
  // что вызовет rerender компонента и по новой

  // useEffect выполняется после каждого render компонента
  // если не указать dependencies, то useEffect соответствует методу
  // componentDidUpdate в классовом компоненте и выполняется после каждого render компонента
  // если указать [] как dependencies, то это будет соответствовать componentDidMount

  // Тут fetch не нужен, так как он дублируется в search пустой строкой
  // useEffect(() => {
  //   fetch('https://react-hooks-update-e9127-default-rtdb.firebaseio.com/ingredients.json')
  //       .then(response => response.json())
  //       .then(responseData => {
  //         const loadedIngredients = [];
  //         for (const key in responseData) {
  //           if (responseData.hasOwnProperty(key)) {
  //             loadedIngredients.push({
  //               id: key,
  //               title: responseData[key].title,
  //               amount: responseData[key].amount
  //             });
  //           }
  //         }
  //         setUserIngredients(loadedIngredients);
  //       });
  // }, []);

  // Данный useEffect будет выполняться, только, если
  // data changed
  useEffect(() => {
    if (!isLoading && !error && identifier === 'REMOVE_INGREDIENT') {
    dispatch({type: 'DELETE', id: extra})
    } else if (!isLoading && !error && identifier === 'ADD_INGREDIENT') {
      dispatch({type: 'ADD', ingredient: {id: data.name, ...extra}})
    }
  }, [data, extra, identifier, isLoading, error]);

  // При rerender компонента создается новый объект функции, поэтому
  // нужно использовать хук useCallback. Хук useCallback вернёт
  // мемоизированную версию колбэка, который изменяется только,
  // если изменяются значения одной из зависимостей
  // setUserIngredients не нужна передавать как dependencies, она не меняется,
  // это гарантируется самим React
  const filteredIngredientsHandler = useCallback(filteredIngredients => {
    // setUserIngredients(filteredIngredients);
    dispatch({type: 'SET', ingredients: filteredIngredients});
  }, []);

  // Так как ingredientForm компонент использует React memo на props,
  // то rendering его компонента будет зависеть только от loading, а
  // использованием useCallback для добавления игрединента, мы
  // устраняем его дополнительный рендеринг, так как функция
  // в props остается неизменной
  const addIngredientHandler = useCallback(ingredient => {
    sendRequest('https://react-hooks-update-e9127-default-rtdb.firebaseio.com/' +
        'ingredients.json', 'POST', JSON.stringify(ingredient), ingredient, 'ADD_INGREDIENT');
    // setIsLoading(true);
    // dispatchHttp({type: 'SEND'});
    // fetch('https://react-hooks-update-e9127-default-rtdb.firebaseio.com/ingredients.json', {
    //   method: 'POST',
    //   // id ingredient генерируется firebase автоматически,
    //   // нам его добавлять не надо вручную
    //   // axios делает stringify и добавляет headers за нас
    //   body: JSON.stringify(ingredient),
    //   headers: {'Content-type': 'application/json'}
    // })
    //     .then(response => {
    //       // setIsLoading(false);
    //       dispatchHttp({type: 'RESPONSE'});
    //       return response.json();
    //     })
    //     .then(responseData => {
    //       // setUserIngredients(prevIngredients =>
    //       //     [...prevIngredients, {id: responseData.name, ...ingredient}]);
    //       dispatch({type: 'ADD', ingredient: {id: responseData.name, ...ingredient}})
    //     });
    // dispatchHttp - это функция React, поэтому React гарантирует, что
    // она не будет изменяться, поэтому ее не надо добавлять в dependencies,
    // а переменная ingredient является локальной
  }, [sendRequest]);

  const removeIngredientHandler = useCallback(id => {
    // setIsLoading(true);
    // dispatchHttp({type: 'SEND'});
    sendRequest(`https://react-hooks-update-e9127-default-rtdb.firebaseio.com/ingredients/${id}.json`,
        'DELETE', null, id, 'REMOVE_INGREDIENT');
  }, [sendRequest]);

  const clearError = useCallback(() => {
    // React делает batch setState функций, он не выполняет их сразу,
    // а проходит до конца handler функций и выполняет их вместе
    // ЭТО АКТУАЛЬНО ТОЛЬКО ДЛЯ synchronous выполнения кода
    // setError(null);
    // setIsLoading(false);
    // dispatchHttp({type: 'CLEAR'});
    clear();
  }, [clear]);

  //Хук useMemo является альтернативой React.memo(), только React.memo
  // используется в компоненте, а useMemo() сохраняет переданное
  // значение и рендерится, когда меняются dependencies

  // По сути, React.memo() обычно используется для компонентов,
  // а useMemo() - для любых значений (например, сложные вычисления),
  // которые не нужно рендерить с каждым render компонента
  const ingredientList = useMemo(() => {
    return <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler} />;
  }, [userIngredients, removeIngredientHandler])

  // Запись error && соответствует тернарному оператору
  // error ? <ErrorModal /> : null

  return (
    <div className="App">
      {error && <ErrorModal onClose={clearError}>{error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={isLoading} />

      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
