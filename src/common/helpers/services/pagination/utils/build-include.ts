import {
  IncludeStructure,
  PrismaIncludeInput,
} from '../schemas/pagination.schema';

export const buildInclude = (relations: string[] = []): PrismaIncludeInput => {
  const includeResult: IncludeStructure = {};

  for (const relation of relations) {
    const relationParts = relation.split('.');
    let currentLevel: IncludeStructure = includeResult;

    for (let i = 0; i < relationParts.length; i++) {
      const part = relationParts[i];
      const isLastPart = i === relationParts.length - 1;

      if (isLastPart) {
        currentLevel[part] = true;
      } else {
        if (!currentLevel[part]) {
          currentLevel[part] = { include: {} };
        }
        const nestedInclude = currentLevel[part] as {
          include: IncludeStructure;
        };
        currentLevel = nestedInclude.include;
      }
    }
  }

  return includeResult;
};
