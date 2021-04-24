import React, {useState} from 'react';

import Card from '../UI/Card';
import LoadingIndicator from "../UI/LoadingIndicator";
import './IngredientForm.css';

const IngredientForm = React.memo(props => {
  // возвращает массив с двумя элементами - состоянием
  // и функцией обновления состояния
  const [enteredTitle, setEnteredTitle] = useState('');
  const [enteredAmount, setEnteredAmount] = useState('');
  console.log('RENDERING INGREDIENT FORM');

  // Нельзя использовать хуки внутри if statement, for loop
  // if (true) {
  //   useState();
  // }
  const submitHandler = event => {
    // Любые React hooks можно использовать только в корне компонента
    // Нельзя использовать хуки внутри функций функционального компонента
    // useState();
    event.preventDefault();
    props.onAddIngredient({
      title: enteredTitle,
      amount: enteredAmount
    });
  };

  // React создает свой собственный синтетический event на основе event DOM,
  // поэтому, если есть внутри функция, использующая замыкание на event, мы
  // получим старое значение event, решение - создание const newTitle, newAmount ниже
  return (
    <section className="ingredient-form">
      <Card>
        <form onSubmit={submitHandler}>
          <div className="form-control">
            <label htmlFor="title">Name</label>
            <input type="text" id="title"
                   value={enteredTitle}
                   onChange={event => {
                     setEnteredTitle(event.target.value)
                     // const newTitle = event.target.value;
                     // setInputState(prevInputState => ({
                     //   title: newTitle,
                     //   // указывается, чтобы не потерять в объекте amount
                     //   // при использовании функции обновления состояния -
                     //   // это отличии от классового компонента с setState
                     //   amount: prevInputState.amount
                     // }));
                   }} />
          </div>
          <div className="form-control">
            <label htmlFor="amount">Amount</label>
            <input type="number" id="amount"
                   value={enteredAmount}
                   onChange={event => {
                     setEnteredAmount(event.target.value);
                     // const newAmount = event.target.value;
                     // setInputState(prevInputState => ({
                     //       amount: newAmount,
                     //       // аналогично
                     //       title: prevInputState.title
                     //     }));
                   }} />
          </div>
          <div className="ingredient-form__actions">
            <button type="submit">Add Ingredient</button>
            {props.loading ? <LoadingIndicator /> : null}
          </div>
        </form>
      </Card>
    </section>
  );
});

export default IngredientForm;
