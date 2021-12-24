export function exportCOCO(task, data) {
  console.log(task);
  console.log(data);
  const date = new Date();
  const info = {
    year: date.getFullYear(),
    version: '1.0',
    description: String.raw`${task.title}\n${task.description}`,
    contributor: `${task.owner.username} ${task.worker.username}`,
    url: window.location.origin,
    date_created: `${date.getFullYear()}/${date.getMonth()}/${date.getDay()}`
  };

  const licenses = [
    {
      id: 1,
      name: 'CC BY-NC-SA 2.0',
      url: 'http://creativecommons.org/licenses/by-nc-sa/2.0/'
    }
  ];

  const content = JSON.parse(data.content);
  const images = content.map((image) => ({
    id: image.id,
    width: image.width,
    height: image.height,
    file_name: image.name,
    license: 1,
    flickr_url: image.src,
    coco_url: image.src,
    date_captured: image.date_captured
  }));

  let categoryId = -1;
  const categoryIdMap = {};
  const categories = JSON.parse(data.tags).map((tag) => {
    categoryId += 1;
    categoryIdMap[tag] = categoryId;
    return {
      id: categoryId,
      name: tag,
      supercategory: task.title
    };
  });

  const annotations = [];
  content.forEach((image) => {
    image.regions.forEach((region) => {
      let beginX = 0;
      let beginY = 0;
      let width = 0;
      let height = 0;
      const segmentation = [];
      let area = 0;
      let minX = image.width;
      let minY = image.height;
      let maxX = 0;
      let maxY = 0;
      switch (region.type) {
        case 'box':
          beginX = image.width * region.x;
          beginY = image.height * region.y;
          width = image.width * region.w;
          height = image.height * region.h;
          area = width * height;
          break;
        case 'point':
          beginX = image.width * region.x;
          beginY = image.height * region.y;
          width = 1;
          height = 1;
          area = 1;
          break;
        case 'polygon':
          region.points.forEach((point) => {
            point[0] *= image.width;
            point[1] *= image.height;
            minX = Math.min(minX, point[0]);
            minY = Math.min(minY, point[1]);
            maxX = Math.max(maxX, point[0]);
            maxY = Math.max(maxY, point[1]);
            segmentation.push(point[0]);
            segmentation.push(point[1]);
          });
          beginX = minX;
          beginY = minY;
          width = maxX - minX;
          height = maxY - minY;
          area = width * height;
          break;
        case 'line':
          beginX = image.width * region.x1;
          beginY = image.height * region.y1;
          width = image.width * region.x2;
          height = image.height * region.y2;
          area = width * height;
          break;
        default:
          break;
      }
      region.tags.forEach((tag) => {
        const annotation = {
          id: region.id,
          image_id: image.id,
          category_id: categoryIdMap[tag],
          segmentation: [segmentation],
          area,
          bbox: [beginX, beginY, width, height],
          iscrowd: 0
        };
        annotations.push(annotation);
      });
    });
  });
  const COCO = { info, licenses, images, categories, annotations };

  const blob = new Blob([JSON.stringify(COCO)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `COCO-${task.title}-${date.getFullYear()}${date.getMonth()}${date.getDay()}`;
  document.documentElement.appendChild(a);
  a.click();
  document.documentElement.removeChild(a);
}

export function exportVOC(task, data) {
  console.log('exportVOC');
  console.log(task);
  console.log(data);
}
