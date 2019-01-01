def TVLookup(frequency):
    frequency = float(frequency)
    return int((frequency - 470) / 6 + 14)
