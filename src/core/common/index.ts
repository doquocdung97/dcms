export * from './filehelper';
export * from './loggerhelper';
export * from './graphqlscalartype';
export function handleUpdateJoinTable<T, B>(
  objects: B[],
  connects: T[],
  check: (item: T, objects: B[], index: number) => boolean,
  update: (item: T, object: B) => void,
  create: (object: B) => T,
) {
  let create_item: T[] = [];
  let update_item: T[] = [];
  let delete_item: T[] = [];
  let current_index = 0;
  connects.map((item: T, index: number) => {
    if (check(item, objects, index)) {
      update(item, objects[index]);
      update_item.push(item);
    } else {
      delete_item.push(item);
    }
    current_index = index + 1;
  });
  if (current_index < objects.length && delete_item.length == 0) {
    for (let i = current_index; i < objects.length; i++) {
      let element = objects[i];
      let rowdata = create(element);
      create_item.push(rowdata);
    }
  }
  return { create_item, update_item, delete_item };
}
export function parseBoolean(val: any): boolean {
  if (val == 'true' || val == '1' || val == 1) {
    return true;
  }
  return false;
}
