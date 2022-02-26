export const dirPath = process.env.GITHUB_WORKSPACE || '.'

export const cruiseOptions = {
  includeOnly: '',
  exclude: ['^(coverage|test|node_modules)', '__tests__'],
  tsConfig: {
    fileName: 'tsconfig.json'
  }
}

export const indexFileRegex = /^.*index\.(ts|js|tsx|jsx)$/
