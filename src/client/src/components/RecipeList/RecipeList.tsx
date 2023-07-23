import React from 'react';
import { useQuery, gql } from '@apollo/client';
import './RecipeList.css'

const GET_RECIPES = gql`
  query {
    recipes {
      name
    }
  }
`;

const RecipeList = () => {
  const { loading, error, data } = useQuery(GET_RECIPES);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container">
      <h1>Recipes</h1>
      <ul>
        {data.recipes.map((recipe, index) => (
          <li key={index} data-testid={`recipe-name-${index}`}>
            {recipe.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeList;
