# function to calculate average of a list of numbers
def calculate_average(numbers: list[int | float]) -> float:
    """
    Calculate the average of a list of numbers.
    
    Args:
        numbers: A list of integers or floats.
        
    Returns:
        The average value as a float. Returns 0 if the list is empty.
    """
    if len(numbers) == 0:
        return 0
    total = sum(numbers)
    average = total / len(numbers)
    return average

# test the function with a sample list of numbers
sample_numbers: list[int] = [10, 20, 30, 40, 50]
average_result: float = calculate_average(sample_numbers) # type: ignore
print(f"The average of {sample_numbers} is: {average_result}")