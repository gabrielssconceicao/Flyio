import { generateFindAllUsersResponseDtoMock } from './generate-find-all-users-response.dto.mock';
describe('<FindAllUsersResponseDto />', () => {
  it('should generate a valid find all users response dto mock', () => {
    const result = generateFindAllUsersResponseDtoMock();

    expect(result.count).toBe(1);
    expect(result.items.length).toEqual(1);

    expect(result).toMatchSnapshot();
  });
});
