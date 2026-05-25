const admin = require("firebase-admin");

const serviceAccount =
  require("../serviceAccountKey.json");

admin.initializeApp({
  credential:
    admin.credential.cert(
      serviceAccount
    ),
});

const db =
  admin.firestore();

async function migrateUsers() {

  const snap = await db
    .collection("users")
    .get();

  let updated = 0;

  for (const doc of snap.docs) {

    const data = doc.data();

    // already migrated
    if (
      Array.isArray(
        data.branchIds
      )
    ) {
      continue;
    }

    const branchIds =
      data.branchId
        ? [data.branchId]
        : [];

    await doc.ref.update({
      branchIds,
    });

    updated++;

    console.log(
      `Migrated: ${doc.id}`
    );
  }

  console.log(
    `Done ✅ Updated ${updated} users`
  );
}

migrateUsers()
  .then(() => process.exit())
  .catch((err) => {

    console.error(err);

    process.exit(1);
  });