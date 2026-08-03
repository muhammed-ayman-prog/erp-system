export const getKey = (item) =>
  `${item.productId || item.id}_${
    (item.containerType || item.container || "")
      .toLowerCase()
      .trim()
  }_${item.size}`;



export const isFullyRefunded = (
  refundedQty,
  refundedMl,
  totalProducts,
  totalMl
) => {

  const productsDone =
    totalProducts === 0 ||
    refundedQty >= totalProducts;


  const oilsDone =
    totalMl === 0 ||
    refundedMl >= totalMl;


  return productsDone && oilsDone;

};



export const formatDate = (value) => {

  if (!value?.seconds) return "-";

  return new Date(
    value.seconds * 1000
  ).toLocaleDateString();

};



export const formatDateTime = (value) => {

  if (!value?.seconds) return "-";

  return new Date(
    value.seconds * 1000
  ).toLocaleString();

};