export function isDateInRange(
  date,
  fromDate,
  toDate
) {

  if (!date) return false;

  let targetDate;


  // Firestore Timestamp
  if (typeof date.toDate === "function") {
    targetDate = date.toDate();
  }

  // Firestore raw timestamp
  else if (date?.seconds) {
    targetDate = new Date(
      date.seconds * 1000
    );
  }

  // Date / String
  else {
    targetDate = new Date(date);
  }


  if (isNaN(targetDate.getTime())) {
    return false;
  }


  const target = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );


  if (fromDate) {
    const start = new Date(fromDate);

    start.setHours(
      0,
      0,
      0,
      0
    );

    if (target < start) {
      return false;
    }
  }


  if (toDate) {
    const end = new Date(toDate);

    end.setHours(
      23,
      59,
      59,
      999
    );

    if (target > end) {
      return false;
    }
  }


  return true;
}



// Default Filter = Today

export function getTodayRange() {

  const today = new Date();


  const date =
    `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;


  return {
    fromDate: date,
    toDate: date
  };
}