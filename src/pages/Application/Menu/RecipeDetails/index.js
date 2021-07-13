/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import DrinkDetails from './DrinkDetails';
import MealDetails from './MealDetails';
import { fetchItemById, fetchMealsOrDrinks } from '../../../../services/apisMaps';
import { startRecipe } from '../../../../slices/inProgressRecipes';
import { RecipeDetailContainer } from '../../../../styles/recipeDetails';

const NUM_RECOMMENDATIONS = 6;
const INITIAL_STATE = {
  recommendation: undefined,
  recipeData: undefined,
};

const inProgressLink = (type, id) => (
  type === 'meals' ? `/comidas/${id}/in-progress` : `/bebidas/${id}/in-progress`);

const floatingBtnStates = (type, id, allowFinish) => ({
  start: {
    testid: 'start-recipe-btn',
    label: 'Iniciar Receita',
    to: inProgressLink(type, id),
    disabled: false,
  },
  continue: {
    testid: 'start-recipe-btn',
    label: 'Continuar Receita',
    to: inProgressLink(type, id),
    disabled: false,
  },
  finish: {
    testid: 'finish-recipe-btn',
    label: 'Finalizar Receita',
    to: '/receitas-feitas',
    disabled: allowFinish,
  },
});

const handleBtn = ({ progress, dispatch, id, type }) => () => {
  switch (progress) {
  case 'continue': break;
  case 'finish': break;
  case 'start': { dispatch(startRecipe({ id, type })); break; }
  default: break;
  }
};

function inProgressHandle({ type, inProgressRecipes, inProgress, id, dispatch }) {
  const inProgresskey = type === 'meals' ? 'meals' : 'cocktails';
  const isInProgress = Object.keys(inProgressRecipes[inProgresskey])
    .some((key) => key === id);
  const progress = (() => {
    if (inProgress && isInProgress) return 'finish';
    if (!inProgress && isInProgress) return 'continue';
    if (inProgress && !isInProgress) {
      dispatch(startRecipe({ id, type }));
      return 'finish';
    }
    return 'start';
  })();
  return { progress };
}

function RecipeDetails({ type, id, inProgress }) {
  const [data, setData] = useState(INITIAL_STATE);
  const dispatch = useDispatch();
  const [allowFinish, setAllowFinish] = useState(true);
  const inProgressRecipes = useSelector((st) => st.inProgressRecipes);
  const inverseType = type === 'meals' ? 'drinks' : 'meals';

  useEffect(() => {
    (async () => {
      const recipeData = await fetchItemById(type)(id);
      const recommendation = await fetchMealsOrDrinks(inverseType)(NUM_RECOMMENDATIONS);
      setData({ recommendation, recipeData });
    })();
    return () => { setData(INITIAL_STATE); };
  }, [type]);

  if (data.recipeData === null) return <h1>Receita não encontada</h1>;
  if (data.recommendation === undefined
    || data.recipeData === undefined
    || data === undefined
    || (type === 'meals' && data.recipeData.idMeal === undefined)
    || (type === 'drinks' && data.recipeData.idDrink === undefined)) {
    return <h1>Loading...</h1>;
  }

  /* Handle in-progress behaviour */
  const { progress } = inProgressHandle({
    dispatch, id, inProgress, inProgressRecipes, type });

  const BtnStyles = {
    position: 'fixed',
    bottom: 0,
    left: '50%' };

  return (
    <RecipeDetailContainer>
      {type === 'drinks'
        ? (
          <DrinkDetails
            data={ { ...data, setAllowFinish } }
            inverseType={ inverseType }
            inProgress={ inProgress }
          />)
        : (
          <MealDetails
            data={ { ...data, setAllowFinish } }
            inverseType={ inverseType }
            inProgress={ inProgress }
          />
        )}

      <Link
        to={ floatingBtnStates(type, id)[progress].to }
      >
        <button
          type="button"
          style={ BtnStyles }
          disabled={ floatingBtnStates(type, id, allowFinish)[progress].disabled }
          onClick={ handleBtn({ progress, dispatch, id, type }) }
          data-testid={ floatingBtnStates(type, id)[progress].testid }
        >
          {floatingBtnStates(type, id)[progress].label}
        </button>
      </Link>
    </RecipeDetailContainer>
  );
}

RecipeDetails.propTypes = {
  type: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  inProgress: PropTypes.bool,
};

RecipeDetails.defaultProps = {
  inProgress: false,
};

export default RecipeDetails;
