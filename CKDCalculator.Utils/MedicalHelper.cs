namespace CKDCalculator.Utils;

public static class MedicalHelper
{
    public static int YearsPassedFrom(DateTime time)
    {
        DateTime zeroTime = new(1, 1, 1);
        TimeSpan span     = DateTime.Now - time;

        return (zeroTime + span).Year - 1;
    }
    
    // eGFR = 186 x (Creat / 88.4)^-1.154 x (Age)^-0.203 x (0.742 if female) x (1.210 if black)
    public static double CalculateKidneyFunction(double creatine, DateTime dob, Gender gender, bool isBlack) =>
        186 * Math.Pow(creatine / 88.4, -1.154) * Math.Pow(YearsPassedFrom(dob), -0.203)
        * (gender == Gender.Female ? 0.742 : 1) * (isBlack ? 1.210 : 1);
}