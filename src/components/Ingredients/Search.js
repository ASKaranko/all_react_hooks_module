import React, {useState, useEffect, useRef} from 'react';

import Card from '../UI/Card';
import useHttp from "../../hooks/http";
import ErrorModal from "../UI/ErrorModal";
import './Search.css';

const Search = React.memo(props => {
  const {onLoadIngredients} = props;
  const [enteredFilter, setEnteredFilter] = useState('');
  const inputRef = useRef();
  const {isLoading, data, error, sendRequest, clear} = useHttp();

  // useEffect МОЖЕТ возвращать значение и это значение
  // должно быть функцией
  useEffect(() => {
    // debounce
    // enteredFilter будет значением, таймер установится
    // useRef даст нам возможность сравнить enteredFilter
    // на момент установки таймера с текущим значением
    const timer = setTimeout(() => {
      if (enteredFilter === inputRef.current.value) {
        const query = enteredFilter.length === 0
            ? ''
            : `?orderBy="title"&equalTo="${enteredFilter}"`;
        sendRequest('https://react-hooks-update-e9127-default-rtdb.firebaseio.com/' +
            'ingredients.json' + query, 'GET');
        // fetch('https://react-hooks-update-e9127-default-rtdb.firebaseio.com/ingredients.json' + query)
        //     .then(response => response.json())
        //     .then(responseData => {
        //       const loadedIngredients = [];
        //       for (const key in responseData) {
        //         if (responseData.hasOwnProperty(key)) {
        //           loadedIngredients.push({
        //             id: key,
        //             title: responseData[key].title,
        //             amount: responseData[key].amount
        //           });
        //         }
        //       }
              // нужно указать данный конкретный props, как dependencies,
              // и, хотя, это функция, но в JS функции - это объекты, поэтому
              // они могут изменяться, поэтому в корне компонента выполняем
              // деструктуризацию объекта props
              // onLoadIngredients(loadedIngredients);
            // });
      }
    }, 500);
    // В данном случае return выполниться при следующем новом значении
    // dependencies, и если это dependencies поступит раньше 500 мс, то
    // мы выполним clearTimeout и callback функция в setTimeout не выполниться
    // Если же dependencies является пустым массивом, то return выполниться,
    // когда компонент размонтируется
    return () => {
      clearTimeout(timer);
    };
  }, [enteredFilter, sendRequest, inputRef]);

  useEffect(() => {
    if (!isLoading && !error && data) {
      const loadedIngredients = [];
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          loadedIngredients.push({
            id: key,
            title: data[key].title,
            amount: data[key].amount
          });
        }
      }
      onLoadIngredients(loadedIngredients);
    }
  }, [data, isLoading, error, onLoadIngredients]);

  return (
    <section className="search">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          {isLoading && <span>Loading...</span>}
          <input
              ref={inputRef}
              type="text"
              value={enteredFilter}
              onChange={event => setEnteredFilter(event.target.value)} />
        </div>
      </Card>
    </section>
  );
});

export default Search;
