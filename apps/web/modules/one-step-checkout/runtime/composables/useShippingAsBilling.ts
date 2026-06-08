export const useShippingAsBilling = () => {
  const shippingAsBilling = useState<boolean>('shippingAsBilling', () => true);

  return {
    shippingAsBilling,
  };
};
