import {
  collection,
  query,
  where
} from "firebase/firestore";

export const getBranchQuery = ({
  db,
  collectionName,
  user,
  selectedBranch
}) => {

  // OWNER + ALL
  if (
    user?.role === "owner" &&
    selectedBranch === "all"
  ) {

    return collection(
      db,
      collectionName
    );

  }

  // Specific branch
  return query(
    collection(
      db,
      collectionName
    ),

    where(
      "branchId",
      "==",
      selectedBranch
    )
  );
};