export function loadLocalStorageData(itemKey) {
  try {
    const serializedData = localStorage.getItem(itemKey)
    if (serializedData === null) {
      return undefined
    }
    return JSON.parse(serializedData)
  } catch (err) {
    return undefined
  }
}

export function saveLocalStorageData(data, itemKey) {
  try {
    const serializedData = JSON.stringify(data)
    localStorage.setItem(itemKey, serializedData)
  } catch (err) {
    console.warn(err)
  }
}
