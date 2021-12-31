import X2JS from 'x2js';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

export function exportCOCO(task, data) {
  const date = new Date();
  const info = {
    year: date.getFullYear(),
    version: '1.0',
    description: String.raw`${task.title}\n${task.description}`,
    contributor: `${task.owner.username}, ${task.worker?.username}`,
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
        annotations.push({
          id: region.id,
          image_id: image.id,
          category_id: categoryIdMap[tag],
          segmentation: [segmentation],
          area,
          bbox: [beginX, beginY, width, height],
          iscrowd: 0
        });
      });
    });
  });
  const COCO = { info, licenses, images, categories, annotations };

  const blob = new Blob([JSON.stringify(COCO)], { type: 'application/json' });
  FileSaver(blob, `COCO-${task.title}-${date.getFullYear()}${date.getMonth()}${date.getDay()}`);
}

export function exportVOC(task, data) {
  const date = new Date();

  const zip = new JSZip();
  const x2js = new X2JS();

  JSON.parse(data.content).forEach((image) => {
    console.log(image);
    const annotation = {
      folder: task.title,
      filename: image.name,
      path: image.src,
      source: undefined,
      size: { width: image.width, height: image.height, depth: 3 },
      segmented: 0,
      object: []
    };
    image.regions.forEach((region) => {
      let xMin = image.width;
      let xMax = 0;
      let yMin = image.height;
      let yMax = 0;
      switch (region.type) {
        case 'box':
          xMin = image.width * region.x;
          yMin = image.height * region.y;
          xMax = image.width * region.w + xMin;
          yMax = image.height * region.h + yMin;
          break;
        case 'point':
          xMin = image.width * region.x;
          yMin = image.height * region.y;
          xMax = xMin;
          yMax = yMin;
          break;
        case 'polygon':
          region.points.forEach((point) => {
            xMin = Math.min(xMin, point[0]);
            yMin = Math.min(yMin, point[1]);
            xMax = Math.max(xMax, point[0]);
            yMax = Math.max(yMax, point[1]);
          });
          xMin *= image.width;
          yMin *= image.height;
          xMax *= image.width;
          yMax *= image.height;
          break;
        case 'line':
          xMin = image.width * Math.min(region.x1, region.x2);
          yMin = image.height * Math.min(region.y1, region.y2);
          xMax = image.width * Math.max(region.x1, region.x2);
          yMax = image.height * Math.max(region.y1, region.y2);
          break;
        default:
          break;
      }
      region.tags.forEach((tag) => {
        annotation.object.push({
          name: tag,
          truncate: 0,
          difficult: 0,
          bndbox: {
            xmin: xMin,
            xmax: xMax,
            ymin: yMin,
            ymax: yMax
          }
        });
      });
    });
    const blob = new Blob([x2js.js2xml({ annotation })], { type: 'application/xml' });
    zip.file(`${image.name}.xml`, blob);
  });
  zip.generateAsync({ type: 'blob' }).then((content) => {
    FileSaver(content, `VOC-${task.title}-${date.getFullYear()}${date.getMonth()}${date.getDay()}`);
  });
}
