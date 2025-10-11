// import { Annotation, AnnotationModel, ServiceCategory } from '@t4g/service/data';
// import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';

// export const serviceAnnotationsRepo = {
//   getAll,
//   getById,
//   getByIdDetailed,
//   create,
//   update,
//   delete: _delete,
// };

// async function getAll(): Promise<
//   Array<Annotation>
// > {
//   return AnnotationModel.find().lean()

// }

// async function getById(
//   id: string
// ): Promise<Annotation | null> {
//   return AnnotationModel.findOne({
//     id: new ObjectId(id),
//   })
// }

// async function create(_entity: Partial<Annotation>): Promise<Annotation> {
//   const entity = _entity;

//   return await AnnotationModel.create(entity);
// }

// async function update(
//   id: string,
//   _entity: Partial<Annotation>
// ): Promise<UpdateResult> {
//   const params = _entity;
//   return await AnnotationModel.updateOne({ id: new ObjectId(id) }, params);
// }

// async function _delete(id: string): Promise<DeleteResult> {
//   return await AnnotationModel.deleteOne({ id: new ObjectId(id) });
// }

// async function getByIdDetailed(id: string): Promise<Annotation | null> {
//   return await AnnotationModel.findOne({ id: new ObjectId(id) })
//     .populate('details')
//     .lean();
// }
