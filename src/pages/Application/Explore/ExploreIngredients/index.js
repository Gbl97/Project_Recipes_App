import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import IngredientMeal from './IngredientMeal';
import IngredientDrink from './IngredientDrink';
import { fetchIngredients } from '../../../../services/apisMaps';
import { ListCardContainer } from '../../../../styles/menuListStyles';
import Loading from '../../../../Components/Loading';

const MAX_DATA = 12;
function ExploreIngredients({ type }) {
  const [data, setData] = useState();
  useEffect(() => {
    fetchIngredients(type)().then((responseData) => {
      const apiData = responseData.slice(0, MAX_DATA);
      setData(apiData);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  if (data === undefined) return <Loading />;

  return (
    <ListCardContainer>
      {type === 'meals'
        ? <IngredientMeal data={ data } type={ type } />
        : <IngredientDrink data={ data } type={ type } />}
    </ListCardContainer>
  );
}

ExploreIngredients.propTypes = {
  type: PropTypes.string.isRequired,
};

export default ExploreIngredients;
