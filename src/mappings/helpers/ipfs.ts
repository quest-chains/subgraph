import { ipfs, json, log } from '@graphprotocol/graph-ts';

class Metadata {
  name: string | null;
  description: string | null;
  imageUrl: string | null;
  animationUrl: string | null;
  externalUrl: string | null;
  mimeType: string | null;
  slug: string | null;
  categories: string[] | null;

  constructor() {
    this.name = null;
    this.description = null;
    this.imageUrl = null;
    this.animationUrl = null;
    this.externalUrl = null;
    this.mimeType = null;
    this.slug = null;
  }
}

export function fetchMetadata(details: string): Metadata {
  let metadata = new Metadata();
  if (details == '') return metadata;

  let parts = details.split('/');
  let hash = parts.length > 0 ? parts[parts.length - 1] : '';
  if (hash != '') {
    let ipfsData = ipfs.cat(hash);
    if (ipfsData) {
      log.info('IPFS details from hash {}, data {}', [
        details,
        ipfsData.toString(),
      ]);
      let data = json.fromBytes(ipfsData).toObject();
      let name = data.get('name');
      if (name != null && !name.isNull()) {
        metadata.name = name.toString();
      }
      let description = data.get('description');
      if (description != null && !description.isNull()) {
        metadata.description = description.toString();
      }
      let imageUrl = data.get('image_url');
      if (imageUrl != null && !imageUrl.isNull()) {
        metadata.imageUrl = imageUrl.toString();
      }
      let animationUrl = data.get('animation_url');
      if (animationUrl != null && !animationUrl.isNull()) {
        metadata.animationUrl = animationUrl.toString();
      }
      let externalUrl = data.get('external_url');
      if (externalUrl != null && !externalUrl.isNull()) {
        metadata.externalUrl = externalUrl.toString();
      }
      let mimeType = data.get('mime_type');
      if (mimeType != null && !mimeType.isNull()) {
        metadata.mimeType = mimeType.toString();
      }
      let slug = data.get('slug');
      if (slug != null && !slug.isNull()) {
        metadata.slug = slug.toString();
      }
      let categories = data.get('categories');
      if (categories != null && !categories.isNull()) {
        let categoryList = new Array<string>();
        let categoryArray = categories.toArray();
        for (let i = 0; i < categoryArray.length; ++i) {
          categoryList.push(categoryArray.at(i).toString());
        }
        metadata.categories = categoryList;
      }
    } else {
      log.warning('could not get IPFS details from hash {}', [hash]);
    }
  }

  return metadata;
}
