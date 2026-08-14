export const getGenericAuthMessage = () => 'Invalid email or password';

export const getGenericAccountMessage = (action = 'create') => {
  const messages = {
    create: 'Unable to create account',
    update: 'Unable to update account',
    delete: 'Unable to delete account',
  };

  return messages[action] || 'Unable to process account request';
};
