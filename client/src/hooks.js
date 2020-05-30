import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks';
import {
  messagesQuery,
  addMessageMutation,
  messageAddedSubscription
} from './graphql/queries';

export const useChatMessages = () => {
  // fetches data from server and responds to local updates to cache
  const { data } = useQuery(messagesQuery);

  // messages property defined in gql queries
  const messages = data ? data.messages : [];

  useSubscription(messageAddedSubscription, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      // local state management - cache local state in the client
      // global store - single source of truth for all of local and remote data
      // https://www.apollographql.com/docs/react/data/local-state/
      client.writeData({
        data: {
          messages: messages.concat(subscriptionData.data.messageAdded)
        }
      });
    }
  });

  // returns mutate function. {data, error, loading, called} optional as 2nd arg
  const [addMessage] = useMutation(addMessageMutation);

  // give the component that uses this custom Hook access to messages and addMessage function
  return {
    messages,
    addMessage: (text) => addMessage({ variables: { input: { text } } })
  };
};
