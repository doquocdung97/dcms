export function handleUpdateJoinTable<T>(
  properties: any,
  connect: T[],
  update: (item: T, property: any) => void,
  create: (item: any) => T,
) {
  let create_item: T[] = [];
  let update_item: T[] = [];
  let delete_item: T[] = [];
  let current_index = 0;
  connect.map((item: T, index: number) => {
    if (
      item['property'] &&
      item['property']['id'] &&
      index < properties.length
    ) {
      update(item, properties[index]);
      update_item.push(item);
    } else {
      delete_item.push(item);
    }
    current_index = index + 1;
  });
  if (current_index < properties.length && delete_item.length == 0) {
    for (let i = current_index; i < properties.length; i++) {
      let element = properties[i];
      element = create(element);
      create_item.push(element);
    }
  }
  return { create_item, update_item, delete_item };
}
